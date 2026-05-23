export const updateButtonBottom = (
  sideBoxRef: React.RefObject<HTMLDivElement | null>,
  setCombinedBottom: (bottom: number) => void,
  maxBottomNum: number,
) => {
  const footerEl = document.querySelector("#footer");
  const sideBoxEl = sideBoxRef.current;
  if (!footerEl || !sideBoxEl) return;

  const footerRect = footerEl.getBoundingClientRect();
  const sideBoxRect = sideBoxEl.getBoundingClientRect();
  const viewportHeight = window.innerHeight;

  let footerBasedBottom = 28;
  const isFooterVisible =
    footerRect.top < viewportHeight && footerRect.bottom > 0;
  if (isFooterVisible) {
    footerBasedBottom = footerRect.height + 100;
  }
  const maxBottom = viewportHeight - sideBoxRect.bottom - maxBottomNum;

  // Final bottom is the smaller of the two (to keep button low enough)
  const finalBottom = Math.min(footerBasedBottom, maxBottom);
  setCombinedBottom(Math.max(28, finalBottom)); // never go below 28px
};
