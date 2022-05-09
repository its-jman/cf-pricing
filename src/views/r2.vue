<template>
    <div class="">
        <div class="card ~primary @low mt-4 mb-12 text-sm px-4 py-3">
            <b>
                ☁ Explaining the costs
            </b><br/>
            <p>
                R2 has no bandwidth costs, for ingesting or exgress. However it is designed as a "hot" storage. This means files are fast to access however cost more than a backup solution such as Backblaze's B2®.
            </p>
        </div>

        <div class="flex flex-col md:flex-row mb-8 items-center" v-if="months.length">
            <h1 class="title text-purple-400 block mb-4 md:mb-0 flex-grow">
                Total (first month): ${{((months[0] || {}).total).toFixed(2)}}
            </h1>
        </div>

        <p class="font-medium text-gray-300 mt-2 mb-2">
            With an inital bucket size of {{pricing.files_stored * (pricing.average_file_size / 1000)}}GB, growing by {{  pricing.writes * (pricing.average_file_size / 1000) }}GB per month.
        </p>

        <canvas id="myChart" class="w-full mb-2" height="350" ref="canvas"></canvas>

        <p class="text-gray-300 text-center text-xs mb-12 block">
            Pricing is estimated on the values below, adding the writes to the bucket each month. In production, this value will change and fluctuate however for estimation purposes, it is linear. us-east-1 used for S3 pricing, egress fees added (13% of the bucket read once and sent across the internet).
        </p>

        <o-field v-if="ready" class="mb-4" :label="`How many files are you currently storing? (using ${pricing.files_stored * (pricing.average_file_size / 1000)}GB)`">
            <o-input  type="number" class="field w-full my-2" :min="1" v-model="pricing.files_stored"/>
        </o-field>

        <o-field v-if="ready" :label="`How big is your average file in megabytes?`" :message="`Costs $0.015/GB stored.`">
            <o-input  type="number" class="field w-full my-2" v-model="pricing.average_file_size"/>
        </o-field>

        <o-field v-if="ready" :label="`How many files are you reading from R2® per month?`" :message="`Counted in requests. Costs $0.36/million read requests.`">
            <o-input type="number" class="field w-full my-2" v-model="pricing.reads"/>
        </o-field>

        <o-field v-if="ready" :label="`How many files are you adding per month?`" :message="`Counted in requests. Costs $4.50/million write requests.`">
            <o-input type="number" class="field w-full my-2" v-model="pricing.writes"/>
        </o-field>

        <o-field v-if="ready" :label="`How many files are you updating and/or deleting?`" :message="`Counted in requests. Costs $4.50/million Class-A requests`">
            <o-input type="number" class="field w-full my-2" v-model="pricing.update_deletes"/>
        </o-field>
    </div>
</template>

<script>
    import VueNumeric from 'vue-numeric'
    import human from 'humanize-plus'
    import humanize from 'humanize'

    // for the R2 calculator, we want to calc these parameters all over the next month:
    // total files - starting bucket size
    // reads - how many times are you reading from R2 per month
    // writes - how many files are being added per month
    // updates / deletes (in one metric) - 
    // then we need to extract the per month cost of this and turn into a graph over time

    var chart

    function debounce(func, timeout = 300){
        let timer;
        return function (...args) {
            clearTimeout(timer);
            timer = setTimeout(() => { func.apply(this, args); }, timeout);
        }
    }

    export default {
        data: () => ({
            human,
            humanize,
            mode: 'simple',
            ready: false,
            show_preview_modal: false,
            chart: null,
            pricing: {
                files_stored: 10_000, // singular
                average_file_size: 5, // megabytes
                reads: 450_000, // single requests
                writes: 25_000, // single requests
                update_deletes: 25_000 // single requests
            },
            rates: {
                average_file_size: 0.015, // per gigabyte (easy to calc, just times this by the average_file_size * files_stored)
                reads: 0.36 / 1_000_000, // Class B operations (reads) only cost 0.36 per 1 million
                writes: 4.50/ 1_000_000, // Class A operations (writes)
                update_deletes: 4.50 / 1_000_000, // Class A operations (writes)
                included_storage: 10,
            },
            aws_rates: {
                average_file_size: 0.023, // per gigabyte (easy to calc, just times this by the average_file_size * files_stored)
                reads: 0.4 / 1_000_000, // Class B operations (reads) only cost 0.36 per 1 million
                writes: 5 / 1_000_000, // Class A operations (writes)
                update_deletes: 5 / 1_000_000, // Class A operations (writes)
            },
            digitalocean_rates: {
                average_file_size: 0.02, // per gigabyte (easy to calc, just times this by the average_file_size * files_stored)
                reads: 0 / 1_000_000, // Class B operations (reads) only cost 0.36 per 1 million
                writes: 0 / 1_000_000, // Class A operations (writes)
                update_deletes: 0 / 1_000_000, // Class A operations (writes)
                included_storage: 250
            },
            free_tiers: {
                average_file_size: 10, // 10GB free per month
                reads: 10_000_000, // 10 mil reads per month allowed
                writes: 1_000_000, // 1 mil writes
                update_deletes: 1_000_000 // 1 mill UDs free
            },
            months: [],
            aws_months: [],

            total: 0,
            preview_url: '',
            loading_preview: false,
            preview_results: {}
        }),
        watch: {
            pricing: {
                handler: debounce(function () {
                    this.work_out_cost()
                }),
                deep: true
            },
        },
        methods: {
            share(extra) {
                if (extra === undefined ) {var extra = {}}
                //this.$router.replace({ path: '/', query: { rpm: this.amount_of_reqs, spr: this.seconds_per_req, url: this.$route.query.url || '' }})
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
                this.months = []

                var last_months_used_files = parseInt(this.pricing.files_stored)

                const months = []
                const aws_months = []

                Array.from({length: 24}, (x, i) => i).forEach(month => {
                    const used_files = last_months_used_files + parseInt(this.pricing.writes)

                    const work_out_total = (name, rates) => {
                        var total = 0
                        const gb_used = used_files * (parseInt(this.pricing.average_file_size) / 1000)
                        const gb_actual = gb_used - (rates.included_storage || 0)
                        total += gb_actual > 0 ? gb_actual * rates.average_file_size : 0
                        total += parseInt(this.pricing.reads) * rates.reads
                        total += parseInt(this.pricing.writes) * rates.writes
                        total += parseInt(this.pricing.update_deletes) * rates.update_deletes

                        return total
                    }

                    var total = work_out_total('R2', this.rates)
                    var aws_total = work_out_total('S3', this.aws_rates)
                    var digitalocean_total = 5 + work_out_total('SP', this.digitalocean_rates)

                    last_months_used_files = last_months_used_files + parseInt(this.pricing.writes)

                    // work out AWS egress
                    // based on 13% of the bucket being sent over the internet
                    const files_to_send = (last_months_used_files * 13) / 100

                    aws_total += files_to_send * (parseInt(this.pricing.average_file_size) / 1000) * 0.09

                    months.push({
                        month,
                        total,
                        aws_total,
                        digitalocean_total,
                        files_in_store: used_files * (parseInt(this.pricing.average_file_size) / 1000)
                    })
                })

                this.months = months
                this.aws_months = aws_months

                this.render_chart()

                this.setMeta()
                this.share()
            },
            async render_chart() {
                if (!this.months.length) {
                    await new Promise(r => setTimeout(r, 1000))
                }

                if (chart) {
                    chart.data.datasets[0].data = this.months.map(x => (x.total).toFixed(2))
                    chart.data.datasets[1].data = this.months.map(x => (x.aws_total).toFixed(2))
                    chart.data.datasets[2].data = this.months.map(x => (x.digitalocean_total).toFixed(2))
                    chart.update()
                    return
                }

                const ctx = this.$refs.canvas.getContext('2d')

                chart = new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: this.months.map(x => 'Month ' + (x.month + 1)),
                        datasets: [
                            {
                                label: 'Cloudflare R2®',
                                fill: 'origin',
                                pointHitRadius: 10,
                                backgroundColor: '#f48120', // Put the gradient here as a fill color
                                data: this.months.map(x => (x.total).toFixed(2)),
                                total_size: this.months.map(x => x.files_in_store),
                                borderWidth: 1
                            },
                            {
                                label: 'DigitalOcean Spaces®',
                                fill: 'origin',
                                pointHitRadius: 10,
                                backgroundColor: '#0069ff',
                                data: this.months.map(x => (x.digitalocean_total).toFixed(2)),
                                borderWidth: 1
                            },
                            {
                                label: 'Amazon S3® (us-east-1)',
                                fill: 'origin',
                                pointHitRadius: 10,
                                backgroundColor: '#232f3e',
                                data: this.months.map(x => (x.aws_total).toFixed(2)),
                                borderWidth: 1
                            },
                        ]
                    },
                    options: {
                        scales: {
                            yAxes: {
                                ticks: {
                                    beginAtZero: true,
                                    fontColor: 'grey'
                                },
                            },
                            xAxes: {
                                ticks: {
                                    fontColor: 'grey'
                                },
                            }
                        },
                        interaction: {
                            intersect: false,
                            mode: 'index',
                        },
                        plugins: {
                            tooltip: {
                                callbacks: {
                                    footer: (context) => {
                                        return `Based on ${context[0].dataset.total_size[context[0].dataIndex]}GB stored` 
                                    },
                                    label: (context) => {
                                        let label = context.dataset.label || '';

                                        if (label) {
                                            label += ': ';
                                        }

                                        if (context.parsed.y !== null) {
                                            label += new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(context.parsed.y);
                                        }

                                        return label;
                                    }
                                }
                            }
                        }
                    }
                })             
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
            VueNumeric,
        }
    }
</script>
