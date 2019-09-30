<script context="module">
  function reduce(map, fn) {
    if (!Array.isArray(map)) {
      fn(map);
    } else {
      map.forEach(value => {
        reduce(value, fn);
      });
    }
  }

  function pageInfo(pages) {
    let count = 0;

    return pages.map((tracks, k) => ({
      index: k,
      tracks: tracks.map((track, l) => ({
        index: l,
        controls: track.map(control => {
          if (control) {
            count += 1;
            control.offset = count;
          }

          return control;
        }),
      })),
    }));
  }
</script>

<script>
  import { onMount } from 'svelte';
  export let mappings = [];

  function resetConfiguration() {}
  function saveConfiguration() {}
  function setControl() {}

  // FIXME: activating multiple elements at once [a,b,c, d,e,f, ...]
  // const classes = [];

  // if (control.offset === this.get('selectedControl.offset')) {
  //   classes.push('active');
  // }

  // classes.push('enabled');

  // return classes.join(' ');

  const fixedPages = pageInfo(mappings.slice(0, 2));

  let selectedControl = null;
  let receivedData = [];
  let currentPage = 0;

  $: pageData = fixedPages[currentPage];

  onMount(() => {
    const ws = new WebSocket(`ws://localhost:${+document.location.port + 1}`);

    ws.addEventListener('open', event => {
      ws.send(JSON.stringify({
        status: 'ping',
      }));
    });

    ws.addEventListener('message', event => {
      const info = JSON.parse(event.data);

      if (info.data) {
        receivedData = info.data;

        reduce(mappings, e => {
          if (e && e.channel === info.data[0] && e.index === info.data[1]) {
            e.level = info.data[2];
            selectedControl = e;
          }
        });
      }
    });
  });
</script>

<div class="grid" id="controller">
  <div class="row">
    <div class="cell midi">
    {#if pageData}
      <div>
      {#each pageData.tracks as { index }}
        <div class="cell track">
          <div class="nth">{index + 1}</div>
          <div class="cc encoder"><button on:click={setControl}></button></div>
          <div class="row">
            <div class="cell cc knob left"><button on:click={setControl}></button></div>
            <div class="cell cc knob right"><button on:click={setControl}></button></div>
          </div>
          <div class="row">
            <div class="cell">
              <div class="cc button mute"><button on:click={setControl}></button></div>
              <div class="cc button solo"><button on:click={setControl}></button></div>
              <div class="cc button arm"><button on:click={setControl}></button></div>
            </div>
            <div class="cell">
              <div class="cc fader"><button on:click={setControl}></button></div>
            </div>
          </div>
          <div class="row">
            <div class="cc pad"><button on:click={setControl}></button></div>
            <div class="cc pad"><button on:click={setControl}></button></div>
          </div>
        </div>
      {/each}
      </div>
    {/if}
    <div class="actions row">
      <div class="cell fill">
        <button on:click={() => currentPage = 0} disabled={currentPage === 0}>1</button>
        <button on:click={() => currentPage = 1} disabled={currentPage === 1}>2</button>
      </div>

      <div class="cell nowrap">
        <button on:click={resetConfiguration}>reset</button>
        <button on:click={saveConfiguration}>save</button>
      </div>
    </div>
  </div>

  <div class="cell config">
    {#if selectedControl}
      <pre class="content">{JSON.stringify(selectedControl,null,2)}</pre>
    {/if}
    {#if receivedData}
      <pre class="content">[ {receivedData.join(', ')} ]</pre>
    {/if}
  </div>

</div>

</div>
