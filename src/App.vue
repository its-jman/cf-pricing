<template>
    <div class="bg-gray-900 min-h-screen" >
        <main class="md:px-24 p-8 container mx-auto">
            <div class="flex flex-col md:flex-row items-center relative pt-4 rounded-md overflow-hidden">
                <div class="absolute top-0 w-full h-1 bg-gradient-to-r from-rose-400 via-fuchsia-500 to-indigo-500"></div>

                <div class="flex flex-row items-center md:flex-grow">
                    <logo :logo="$route.meta.logo" class="text-gray-200 w-16 h-16 mr-2" style="flex-shrink:0;"/>

                    <div class="flex-grow">
                        <h1 class="title text-gray-200">
                            {{$route.meta.title}} cost calculator
                        </h1>
                        <h3 class="subtitle text-gray-400">
                            {{$route.meta.description}}
                        </h3>
                    </div>
                </div>

                <div class="flex flex-row items-center justify-center mt-2 md:mt-0">
                    <a href="https://github.com/AggressivelyMeows/workers-unbound-pricing" target="_blank">
                        <svg width="24" height="24" fill="currentColor" class="text-purple-400 mr-3"><path fill-rule="evenodd" clip-rule="evenodd" d="M12 2C6.477 2 2 6.463 2 11.97c0 4.404 2.865 8.14 6.839 9.458.5.092.682-.216.682-.48 0-.236-.008-.864-.013-1.695-2.782.602-3.369-1.337-3.369-1.337-.454-1.151-1.11-1.458-1.11-1.458-.908-.618.069-.606.069-.606 1.003.07 1.531 1.027 1.531 1.027.892 1.524 2.341 1.084 2.91.828.092-.643.35-1.083.636-1.332-2.22-.251-4.555-1.107-4.555-4.927 0-1.088.39-1.979 1.029-2.675-.103-.252-.446-1.266.098-2.638 0 0 .84-.268 2.75 1.022A9.606 9.606 0 0112 6.82c.85.004 1.705.114 2.504.336 1.909-1.29 2.747-1.022 2.747-1.022.546 1.372.202 2.386.1 2.638.64.696 1.028 1.587 1.028 2.675 0 3.83-2.339 4.673-4.566 4.92.359.307.678.915.678 1.846 0 1.332-.012 2.407-.012 2.734 0 .267.18.577.688.48C19.137 20.107 22 16.373 22 11.969 22 6.463 17.522 2 12 2z"></path></svg>
                    </a>

                    <a href="https://twitter.com/ceruthedev" target="_blank">
                        <svg width="20" height="20" fill="currentColor" class="text-purple-400"><path d="M6.29 18.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0020 3.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.073 4.073 0 01.8 7.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 010 16.407a11.616 11.616 0 006.29 1.84"></path></svg>
                    </a>
                </div>
            </div>

            <div class="flex flex-wrap my-2 gap-2 mt-4 md:mt-2">
                <router-link active-class="bg-purple-500" class="text-sm rounded-md bg-gray-800 text-white px-3 py-1 cursor-pointer flex flex-row items-center w-full md:w-auto" to="/">
                    Workers Unbound™
                </router-link>
                <router-link active-class="bg-purple-500" class="text-sm rounded-md bg-gray-800 text-white px-3 py-1 cursor-pointer flex flex-row items-center w-full md:w-auto" to="/r2">
                    Cloudflare R2™
                </router-link>
                <router-link active-class="bg-purple-500" class="text-sm rounded-md bg-gray-800 text-white px-3 py-1 cursor-pointer flex flex-row items-center w-full md:w-auto" to="/ws">
                    Cloudflare Durable Objects™
                </router-link>
                <div class="hidden md:block md:flex-grow"></div>
                <a class="text-sm rounded-md bg-gray-800 text-white px-3 py-1 cursor-pointer flex flex-row items-center w-full md:w-auto" href="https://discord.gg/2hCYBhvuJa" target="_blank">
                    Join the Community
                </a>

            </div>

            <hr class="border-gray-700 my-4"/>

            <router-view />
        </main>

        <div class="mt-24 pb-8 px-2">
            <p class="text-gray-400 text-center text-xs">
                This website is not affliated with Cloudflare. Information on this page is just an estimate and your prices may be different to the results.<br/>
                If you need help, or wish to hire me, you can contact me via Twitter (top right), or email:
                ceru@sponsus.org
            </p>
        </div>
    </div>
</template>

<script setup>
    import logo from './components/logos.vue'



</script>
