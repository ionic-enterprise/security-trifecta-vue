<template>
  <ion-app>
    <ion-router-outlet />
  </ion-app>
</template>

<script setup lang="ts">
import { IonApp, IonRouterOutlet } from '@ionic/vue';
import usePreferences from '@/composables/preferences';

const { load } = usePreferences();
load();
</script>
