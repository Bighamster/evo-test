<script lang="ts">
  export let size = 'md';
  export let icon;
  export let ghost = false;
  export let disabled = false;

  $: buttonStyle = `
    ${size === 'lg' ? 'w-12 h-12 rounded-[15px] bg-gray-hover-main' :
      size === 'sm' ? 'w-9 h-9 rounded-xl bg-white border border-gray-stroke' :
        'w-[42px] h-[42px] rounded-[15px] bg-gray-hover-main'}
    ${ghost ? 'border-0 bg-transparent text-gray-ghost hover:bg-transparent hover:text-gray-medium' :
    'text-black hover:bg-gray-hover'}
    disabled:bg-white disabled:text-gray-disabled disabled:border
    disabled:border-gray-stroke disabled:cursor-not-allowed
  `;
</script>

<button
  class={buttonStyle}
  {disabled}
  on:click
>
  <i class="evo {icon} flex flex-col"></i>
</button>
