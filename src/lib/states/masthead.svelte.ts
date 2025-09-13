class MastheadState {
  height = $state(0);
  isExpanded = $state(false);
  element = $state<HTMLElement | null>(null);

  updateHeight() {
    if (this.element) {
      this.height = this.element.offsetHeight;
    }
  }

  setElement(element: HTMLElement | null) {
    this.element = element;
    if (element) {
      const resizeObserver = new ResizeObserver(() => {
        this.updateHeight();
      });

      resizeObserver.observe(element);
      this.updateHeight();

      return () => {
        resizeObserver.disconnect();
      };
    }
  }

  setExpanded(expanded: boolean) {
    this.isExpanded = expanded;
  }
}

export const mastheadState = new MastheadState();
