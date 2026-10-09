<script setup lang="ts">
import AppHeader from './components/AppHeader.vue'
import TokenFlip from './components/TokenFlip.vue'
import RulesDialog from './components/RulesDialog.vue'
import RulebookDialog from './components/RulebookDialog.vue'
import ExpansionsStep from './pages/ExpansionsStep.vue'
import ObjectivesStep from './pages/ObjectivesStep.vue'
import PawnsStep from './pages/PawnsStep.vue'
import ResultStep from './pages/ResultStep.vue'
import { createGame, provideGame } from './game'

const game = createGame()
provideGame(game)
const { step, result, showToken, info, rulebook } = game
</script>

<template>
  <AppHeader />
  <main>
    <ExpansionsStep v-if="step === 'expansions'" />
    <ObjectivesStep v-else-if="step === 'objectives'" />
    <PawnsStep v-else-if="step === 'pawns'" />
    <ResultStep v-else-if="result" />
  </main>
  <footer class="site-footer">
    <p>Unofficial fan project, not affiliated with Horrible Guild or the game's authors. Railroad Tiles and its artwork belong to their respective owners.</p>
  </footer>
  <TokenFlip v-if="showToken" @close="showToken = false" />
  <RulesDialog v-if="info" v-bind="info" @close="info = null" />
  <RulebookDialog v-if="rulebook" v-bind="rulebook" @close="rulebook = null" />
</template>

<style scoped>
.site-footer { max-width: 1100px; margin: 0 auto; padding: 8px 16px 20px; text-align: center; font-size: .78rem; line-height: 1.4; opacity: .8; }
.site-footer p { margin: 0; }
</style>
