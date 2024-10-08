import {
  type PropsOf,
  type Signal,
  Slot,
  component$,
  useContextProvider,
  useSignal,
  useComputed$,
  useId,
  useTask$,
} from '@builder.io/qwik';
import { CarouselContext, carouselContextId } from './context';
import { useBoundSignal } from '../../utils/bound-signal';
import { useAutoplay } from './use-carousel';

export type CarouselRootProps = PropsOf<'div'> & {
  /** The gap between slides */
  gap?: number;

  /** Number of slides to show at once */
  slidesPerView?: number;

  /** Whether the carousel is draggable */
  draggable?: boolean;

  /** Alignment of slides within the viewport */
  align?: 'start' | 'center' | 'end';

  /** Whether the carousel should loop */
  loop?: boolean;

  /** Bind the selected index to a signal */
  'bind:selectedIndex'?: Signal<number>;

  /** change the initial index of the carousel on render */
  startIndex?: number;

  /**
   * @deprecated Use bind:selectedIndex instead
   * Bind the current slide index to a signal
   */
  'bind:currSlideIndex'?: Signal<number>;

  /** Whether the carousel should autoplay */
  'bind:autoplay'?: Signal<boolean>;

  /** the current progress of the carousel */
  'bind:progress'?: Signal<number>;

  /** Time in milliseconds before the next slide plays during autoplay */
  autoPlayIntervalMs?: number;

  /** @internal Total number of slides */
  _numSlides?: number;

  /** @internal Whether this carousel has a title */
  _isTitle?: boolean;

  /** Allows the user to navigate steps when interacting with the stepper */
  stepInteraction?: boolean;
};

export const CarouselBase = component$(
  ({
    'bind:currSlideIndex': givenOldSlideIndexSig,
    'bind:selectedIndex': givenSlideIndexSig,
    'bind:autoplay': givenAutoplaySig,
    'bind:progress': givenProgressSig,
    _isTitle: isTitle,
    startIndex,
    ...props
  }: CarouselRootProps) => {
    // core state
    const localId = useId();
    const scrollerRef = useSignal<HTMLDivElement>();
    const nextButtonRef = useSignal<HTMLButtonElement>();
    const prevButtonRef = useSignal<HTMLButtonElement>();
    const scrollStartRef = useSignal<HTMLDivElement>();
    const isMouseDraggingSig = useSignal<boolean>(false);
    const slideRefsArray = useSignal<Array<Signal>>([]);
    const bulletRefsArray = useSignal<Array<Signal>>([]);
    const currentIndexSig = useBoundSignal(
      givenSlideIndexSig ?? givenOldSlideIndexSig,
      startIndex ?? 0,
    );
    const isScrollerSig = useSignal(false);
    const isAutoplaySig = useBoundSignal(givenAutoplaySig, false);

    const getInitialProgress = () => {
      return startIndex ? startIndex / ((props._numSlides ?? 1) - 1) : 0;
    };

    // derived
    const numSlidesSig = useComputed$(() => props._numSlides ?? 0);
    const isDraggableSig = useComputed$(() => props.draggable ?? true);
    const slidesPerViewSig = useComputed$(() => props.slidesPerView ?? 1);
    const gapSig = useComputed$(() => props.gap ?? 0);
    const alignSig = useComputed$(() => props.align ?? 'start');
    const isLoopSig = useComputed$(() => props.loop ?? false);
    const autoPlayIntervalMsSig = useComputed$(() => props.autoPlayIntervalMs ?? 0);
    const progressSig = useBoundSignal(givenProgressSig, getInitialProgress());
    const isStepInteractionSig = useComputed$(() => props.stepInteraction ?? false);

    const titleId = `${localId}-title`;

    const context: CarouselContext = {
      localId,
      scrollerRef,
      nextButtonRef,
      prevButtonRef,
      scrollStartRef,
      isMouseDraggingSig,
      slideRefsArray,
      bulletRefsArray,
      currentIndexSig,
      isScrollerSig,
      isAutoplaySig,
      numSlidesSig,
      isDraggableSig,
      slidesPerViewSig,
      gapSig,
      alignSig,
      isLoopSig,
      autoPlayIntervalMsSig,
      startIndex,
      isStepInteractionSig,
    };

    useAutoplay(context);

    useContextProvider(carouselContextId, context);

    useTask$(({ track }) => {
      if (!givenProgressSig) return;
      track(() => currentIndexSig.value);
      track(() => numSlidesSig.value);

      if (numSlidesSig.value > 1) {
        progressSig.value = (currentIndexSig.value / (numSlidesSig.value - 1)) * 100;
      } else {
        progressSig.value = 0;
      }
    });

    return (
      <div
        role="group"
        aria-labelledby={isTitle ? titleId : undefined}
        aria-label={!isTitle ? `content slideshow` : undefined}
        aria-roledescription="carousel"
        aria-live={isAutoplaySig.value ? 'off' : 'polite'}
        data-qui-carousel
        {...props}
        style={{
          '--slides-per-view': slidesPerViewSig.value,
          '--gap': `${gapSig.value}px`,
          '--scroll-snap-align': alignSig.value,
        }}
      >
        <Slot />
      </div>
    );
  },
);
