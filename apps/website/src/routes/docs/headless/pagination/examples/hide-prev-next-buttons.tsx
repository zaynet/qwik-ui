import { component$, useSignal, useStylesScoped$ } from '@builder.io/qwik';
import { Pagination } from '@qwik-ui/headless';
import styles from '../index.css?inline';

export default component$(() => {
  useStylesScoped$(styles);
  const selectedPage = useSignal(1);
  const totalPages = useSignal(10);

  return (
    <div class="mt-4 flex flex-col gap-6">
      <Pagination.Root
        selectedPage={selectedPage.value}
        totalPages={totalPages.value}
        onPageChange$={(page) => {
          selectedPage.value = page;
        }}
        hidePrevButton={true}
        hideNextButton={true}
        class="pagination-wrapper"
        selectedClass="pagination-selected-btn"
        defaultClass="pagination-btn"
        dividerClass="pagination-divider"
        prevButtonClass="prevNextButtons"
        nextButtonClass="prevNextButtons"
      />
    </div>
  );
});
