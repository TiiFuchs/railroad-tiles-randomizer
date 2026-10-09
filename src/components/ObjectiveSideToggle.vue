<script setup lang="ts">
import { useGame } from '../game'

const { side } = useGame()
</script>

<template>
  <div class="side-toggle" role="group" aria-label="Objective side">
    <button :class="{ on: side === 'back' }" @click="side = 'back'">Back</button>
    <button :class="{ on: side === 'front' }" @click="side = 'front'">Front</button>
  </div>
</template>
