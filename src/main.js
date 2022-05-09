import { createApp } from 'vue'
import './tailwind.css'
import App from './App.vue'
import { routes } from './routes.js'
import { createRouter, createWebHistory } from 'vue-router'
import Oruga from '@oruga-ui/oruga-next'

import "./main.scss";

const app = createApp(App)

const router = createRouter({
    history: createWebHistory(),
    routes,
})

app.use(Oruga,{
    iconPack: 'fas',
    button: {
        override: true,
        rootClass: 'button rounded-md',
        roundedClass: 'btn-rounded',
    },
    modal: {
        contentClass: 'card ~neutral !low p-4',
    },
    input: {
        rootClass: 'w-full',
        inputClass: 'my-2 round-md w-full bg-gray-800 text-gray-200'
    },
    field: {
        labelClass: 'text-white',
        messageClass: 'text-gray-400'
    }
})

app.use(router)
app.mount('#app')
