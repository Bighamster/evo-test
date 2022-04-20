<script lang="ts">
  import { onMount } from 'svelte';
  import Button from '$lib/components/UI/Button/Button.svelte';
  import connector, {data as conData, balances, tick} from '$lib/blockchain/connector';

  let connection = {};

  const connect = (): void => connection?.connect();
  const disconnect = (): void => connection?.disconnect();
  const addBnbNetwork = (): void => connection?.addBnbNetwork();

  onMount(() => {
    connection = connector(window.ethereum);
  });

  // $: console.log($conData)
  // $: console.log($balances)
</script>

<header>
  <a href="/" title="Evodefi Homepage" class="logo">
    Evodefi <img src="/evodefi-logo.svg" alt="Evodefi logo" />
  </a>
  <Button size='md' color='gradient' on:click={ $conData.isConnected ? disconnect : connect}>{$conData.isConnected ? 'Disconnect' : 'Connect to Metamask'}</Button>
</header>

{#if $conData.message}
  <h3><strong>{$conData.message}</strong></h3>
{/if}

<ul>
  <li>Account: {$conData.account}</li>
  <li>Network: {$conData.network}</li>
  <li>Balance: {$conData.balance}</li>
</ul>

<br/>

{#if $conData.isConnected}
  {#if $conData.network == 'bnb'}
    <h3><strong>Balances: refreshed {$tick} times </strong></h3>
    <ul>
      {#each $balances as r}
        <li><strong>{r.name}</strong> {r.value}</li>
      {/each}
    </ul>
  {:else}
    <Button size='md' on:click={addBnbNetwork}>Switch to BNB network</Button>
  {/if}
{/if}

<style lang="postcss">
  header {
    @apply 2xl:w-[1440px] w-full mx-auto flex flex-row py-6 px-5 justify-between;
  }
  .logo {
    @apply flex flex-row items-center gap-2 text-2xl font-semibold;
  }
</style>
