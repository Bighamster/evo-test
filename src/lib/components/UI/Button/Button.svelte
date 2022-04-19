<script lang="ts">
  export let size: 'md' | 'lg' = 'md';
  export let color: 'gradient' | 'gray' = 'gradient';
  export let className = '';
  export let type: 'icon' | undefined = undefined;
  export let disabled: boolean | undefined = undefined;
  export let loading = false;
  export let block = false;
  export let style = '';
  export let width = '';
  $: computedView = `button button--${size} button--${color} ${className} button--${
    type ? type : 'default'
  }`;
  $: computedDisabled = disabled === undefined ? loading : disabled;
</script>

<button
  class={computedView}
  disabled={computedDisabled}
  class:loading
  class:w100={block}
  style="--button-width: {width}"
  on:click>
  <span><slot /></span>
</button>

<style lang="scss">
  .button {
    @apply relative ;
    width: var(--button-width);
    padding: 12px 18px;
    border-radius: 15px;
    span {
      @apply relative block;
      z-index: 3;
    }
    span.multipe {
      @apply relative flex justify-between items-center;
    }
    &:disabled {
      z-index: 0;
      opacity: 0.5;
      cursor: default;
    }

    &--gradient {
      background: linear-gradient(247.82deg, #5872ff 35.52%, #a258ff 161.03%);

      color: #fff;

      &:after {
        content: '';
        opacity: 0;
        position: absolute;
        z-index: 0;
        top: 0;
        left: 0;
        bottom: 0;
        right: 0;
        border-radius: inherit;
        transition: opacity 0.3s ease-out;
        background: linear-gradient(233.45deg, #d389a8 0.01%, #9687f0 78.71%);
      }

      &:hover:not(:disabled):after {
        opacity: 1;
      }

      &:disabled {
        border: 1px solid #e2e4e9;
        background: #fff;
        color: #c7c8cb;
      }
    }
    &--gray {
      background: #f8f9fb;
      color: #2b2c2e;

      &:not(:disabled):hover {
        background: #f0f2f7;
      }
      &:active {
        background-color: rgba(51, 32, 32, 0.35);
      }
      &:disabled {
        background: #f8f9fb;
        color: #c7c8cb;
      }
    }
    &--lg {
      padding: 18px 24px;
      font-size: 18px;
      line-height: 24px;
      border-radius: 18px;
      &:disabled.gradient {
        padding: 17px 23px;
      }
    }
    &--md {
      padding: 12px 18px;
      &:disabled.gradient {
        padding: 11px 22px;
      }
    }
  }
  .icon {
    padding: 0;
    min-height: 42px;
    min-width: 42px;
    border-radius: 50%;
    border: none;
    background: transparent;
    display: flex;
    justify-content: center;
    align-items: center;
    &:hover {
      background-color: rgba(255, 255, 255, 0.295);
    }
  }
  .w100 {
    width: 100%;
  }
</style>
