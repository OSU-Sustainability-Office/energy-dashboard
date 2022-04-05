import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
const app = createApp(App);

app.use(createPinia());

// Should probably offload this to a .env
app.config.debug = false;
app.config.devtools = false;
app.config.lang = "en";

app.mount("#app");
