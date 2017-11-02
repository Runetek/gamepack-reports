<template>
  <div id="app">
    <section class="hero">
      <div class="hero-body">
        <router-view/>
      </div>
    </section>
  </div>
</template>

<style src="bulma/bulma.sass" lang="sass"></style>
<style src="font-awesome/css/font-awesome.css" lang="css"></style>

<script>
export default {
  name: 'app'
}
</script>
