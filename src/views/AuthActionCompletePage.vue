<template>
  <ion-content>
    <div class="container">
      <ion-spinner name="dots"></ion-spinner>
    </div>
  </ion-content>
</template>

<script setup lang="ts">
import { IonContent, IonSpinner } from '@ionic/vue';
</script>

<style scoped>
.container {
  text-align: center;

  position: absolute;
  left: 0;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
}
</style>
