<template>
    <div class="">
        <o-modal :active.sync="show_preview_modal">
            <h4 class="title">
                Test your Worker
            </h4>
            <p>
                You can use this tool to test a Worker's response time and size to see how much you would need to pay.
            </p>
            <hr/>
            <o-field class="mt-8" label="URL of the Worker" message="Please make sure it is publicly accessable, otherwise we cant check it!">
                <input class="field my-2" v-model="preview_url" @keypress.enter="test_preview" />
            </o-field>
            <a @click="test_preview_click" class="rounded-lg w-full flex items-center justify-center bg-purple text-white mr-2 px-4 py-2 cursor-pointer flex flex-row items-center" style="border-radius:0.375rem;">
                Test URL
            </a>
        </o-modal>
        <div class="card ~primary @low mt-4 mb-12 text-sm px-4 py-3">
            <b>
                ☁ Explaining the costs
            </b><br/>
            <p>
                Workers Unbound™ is a bit more complex to calculate costs for and so I have built this tool to help people get a better understanding of the pricing model.
                Unbound is a Worker that does not have CPU limits but bills based on <b>wall</b> time.
                This is worked out by timing how long your Worker exists, this does mean you are being billed while waiting for HTTP requests.
                However, it might actually be cheaper for simple workers to be billed on Unbound than Bundled as the per request pricing is far better.
                You are also given 400,000GB-s with your plan so if your Worker is snappy, you wont have to pay for memory.
                <Br/>
                <br/>
                <b>⚡ Requests:</b>
                Every time your Worker executes, you use one request. With DDoS protection, any requests rejected by Cloudflare will NOT count towards this number as your Worker was not executed.
                If your Worker experiences an error, or returns a non-200 status code, it will still count as a request to be billed.
                <br/>
                <b>First 1 million requests are free</b>
                <br/>
                <br/>
                <b>💾 Memory:</b> Each Worker you execute uses 128mb of memory, this is not changable yet. You are charged per millisecond the Worker runs and are billed for each 128MB you use during that time.
                <br/>
                <b>First 400,000-GBs are free.</b>
                <br/>
                <br/>
                <b>As a note: Durable Object costs are the exact same as Unbound workers. You can also use this calculator to work out the pricing however keep in mind that calling a Durable Object from an Unbound worker will result in your bills being effectively doubled as your Unbound worker waits for the Durable Object to complete.</b>
            </p>
        </div>

        <hr class="border-gray-700 my-4"/>

        <div class="flex flex-col md:flex-row mb-8 items-center">
            <h1 class="title text-purple-400 block mb-4 md:mb-0 flex-grow">
                Total: $5 (Paid Worker plan) + ${{(total / 100).toFixed(2)}}
            </h1>

            <a v-if="mode == 'advanced'" @click="mode = 'simple'" class="text-sm rounded-md bg-purple-500 text-white mr-2 px-4 py-2 cursor-pointer flex flex-row items-center  w-full md:w-auto" style="border-radius:0.375rem;">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Simple
            </a>

            <a v-else @click="mode = 'advanced'" class="text-sm  rounded-md bg-purple-500 text-white mr-2 px-4 py-2 cursor-pointer flex flex-row items-center w-full md:w-auto" style="border-radius:0.375rem;">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Advanced
            </a>

            <a class="text-sm rounded-md bg-purple-500 text-white mr-2 px-4 py-2 cursor-pointer flex flex-row items-center w-full md:w-auto mt-4 md:mt-0" style="border-radius:0.375rem;" @click="show_preview_modal = true">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Test Worker
            </a>
        </div>

        <o-field v-if="ready" class="mb-4" :label="`How many requests do you expect to process per month? ($${(pricing.requests / 100).toFixed(2)})`" message="Includes errors, redirects, and successful requests. Costs $0.15/million requests.">
            <o-slider v-if="mode == 'simple'" v-model="amount_of_reqs" :max="10000000" :step="100000"></o-slider>
            <o-input v-if="mode == 'advanced'" type="number" class="field w-full my-2" :min="1" v-model="amount_of_reqs"/>
        </o-field>

        <o-field v-if="ready" :label="`How long does your Worker run for on average? (${human.intComma(pricing.memory_used)}GB-s) ($${(pricing.memory / 100).toFixed(2)})`" :message="`${mode == 'advanced' ? 'Advanced mode: Use decimal to show milliseconds.' : ''} Counted in seconds, billed in milliseconds. 400,000GB-s included, only usage beyond included bundle is shown.  Costs $12.50/million GB-s.`">
            <o-slider v-if="mode == 'simple'" v-model="seconds_per_req" :max="30" :step="0.25" :min="0.25" :custom-formatter="val => val + ' seconds'"></o-slider>
            <o-input v-if="mode == 'advanced'" type="number" class="field w-full my-2" :min="0.50" v-model="seconds_per_req"/>
        </o-field>
    </div>
</template> 

<script>
    import VueNumeric from 'vue-numeric'
    import human from 'humanize-plus'
    import humanize from 'humanize'
    

    export default {
        data: () => ({
            human,
            humanize,
            mode: 'simple',
            ready: false,
            show_preview_modal: false,
            pricing: {
                requests: 0,
                memory: 0,
            },
            rates: {
                requests: 15,
                memory: 1250,
            },
            amount_of_reqs: 100000,
            seconds_per_req: 1,
            total: 0,
            preview_url: '',
            loading_preview: false,
            preview_results: {}
        }),
        watch: {
            amount_of_reqs() {this.work_out_cost()},
            seconds_per_req() {this.work_out_cost()},
        },
        methods: {
            test_preview_click() {
                plausible('worker_preview')
                this.test_preview()
            },
            async test_preview() {
                this.loading_preview = true
                var resp = await fetch('https://unbound-pricing-worker.sponsus.workers.dev/', { method: 'POST', body: JSON.stringify({ url: this.preview_url }), headers: {'Content-Type':'application/json'} }).then(resp => resp.json())
                this.loading_preview = false
                this.preview_results = resp

                this.$oruga.notification.open({
                    message: `Fetched the Worker.<br/>Time taken to respond: ${resp.time_taken} seconds<br/>Size of the response: ${this.humanize.filesize(resp.response_size)}`,
                    variant: 'primary',
                    closable: true,
                    duration: 6000,
                })

                this.seconds_per_req = resp.time_taken

                this.show_preview_modal = false
                
                this.$nextTick(() => {
                    // Append the preview url to the URL, then call share(). This will then also append the stats object.
                    this.$router.replace({ path: '/', query: { url: this.preview_url }})
                    this.preview_url = ''
                })
            },
            share(extra) {
                if (extra === undefined ) {var extra = {}}
                this.$router.replace({ path: '/', query: { rpm: this.amount_of_reqs, spr: this.seconds_per_req, url: this.$route.query.url || '' }})
            },
            setMeta() {
                document.querySelectorAll('[data-metadata]').forEach(el => el.remove())
                const create_tag = (name, content) => {
                    (['', 'og:', 'twitter:']).forEach(prefix => {
                        var link = document.createElement('meta')
                        link.setAttribute('property', prefix + name)
                        link.content = content
                        link.setAttribute('data-metadata', '1')
                        document.getElementsByTagName('head')[0].appendChild(link)
                    })
                }

                create_tag('title', 'Cloudflare Workers: Unbound pricing calculator')
                create_tag('description', `Requests per month: $${(this.pricing.requests / 100).toFixed(2)}\nMemory used: $${(this.pricing.memory / 100).toFixed(2)}\nTotal per month: $5 (Paid Worker plan) + $${(this.total / 100).toFixed(2)}`)
                create_tag('theme-color', '#9561e2')
            },
            work_out_cost() {
                if (!this.ready) {return}
                var total = 0

                // If amount of requests is under 1 mil, ignore.
                if (this.amount_of_reqs > 1000000) {
                    this.pricing.requests = parseFloat(((this.amount_of_reqs - 1000000) * (this.rates.requests / 1000000)).toFixed(3))
                    total = total + this.pricing.requests
                } else {
                    this.pricing.requests = 0 
                }

                // Work out Gigabyte seconds.
                // Convert requests to megabytes used.
                var memory_used_mb = this.amount_of_reqs * 128
                memory_used_mb = memory_used_mb * parseFloat(this.seconds_per_req)

                var gigabytes_used = (memory_used_mb / 1000) // Convert MB-s to GB-s

                gigabytes_used = Math.max(gigabytes_used - 400000, 0)  // Compress to 0 if number is below 0

                this.pricing.memory_used = gigabytes_used
                this.pricing.memory = gigabytes_used * (this.rates.memory / 1000000) // Turn GB-s to an actual cost per month.

                total += this.pricing.memory

                this.total = total

                this.setMeta()
                this.share()
            },
        },
        mounted() {
            this.amount_of_reqs = parseInt(this.$route.query.rpm || '100000')
            this.seconds_per_req = parseFloat(this.$route.query.spr || '1')
            this.ready = true
            this.$nextTick(this.work_out_cost)

            setTimeout(() => {
                if (this.$route.query.url) {
                    this.preview_url = this.$route.query.url
                    this.test_preview()
                }
            }, 50)
        },
        components: {
            VueNumeric
        }
    }
</script>
