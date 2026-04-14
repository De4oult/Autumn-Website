<template>
    <div class="bg-autumn-bg text-autumn-text">
        <section id="hero" class="relative flex min-h-svh flex-col items-center justify-center px-4 pt-24 pb-16 text-center sm:px-6 md:h-screen md:py-0">
            <Leaf class="w-16 h-16 text-autumn-accent mb-6" />
            
            <h1 class="mb-3 text-4xl sm:text-5xl md:text-6xl font-bold">
                {{ name }}
            </h1>
            
            <Badge class="mb-5"> 
                {{ $t('page.landing.hero.version', { version })}}
            </Badge>

            <p class="mb-8 max-w-xl text-base text-autumn-text-secondary sm:text-lg md:mb-10 md:text-xl">
                {{ $t('page.landing.hero.about')}}
                <br>
                {{ $t('page.landing.hero.personality')}}
            </p>

            <div class="flex w-full max-w-sm flex-col justify-center gap-3 sm:max-w-none sm:flex-row sm:gap-4">
                <ButtonPrimary
                    size="lg" 
                    class="w-full sm:w-auto"
                    
                    @click="() => router.push(localePath('/documentation'))" 
                >
                    {{ $t('common.cta') }}
                </ButtonPrimary>
                
                <ButtonLink :href="github" class="w-full sm:w-auto">
                    <Github :size="20" class="inline mr-2" />
                    GitHub
                </ButtonLink>
            </div>

            <div
                @click="scrollToIndex(1)"
                class="absolute bottom-10 hidden cursor-pointer flex-col items-center gap-2 text-autumn-text-muted animate-pulse md:flex"
            >
                <span class="text-xs">scroll</span>
                <ChevronDown :size="20" class="animate-bounce" />
            </div>
        </section>

        <section id="features" class="flex min-h-svh flex-col items-center justify-center px-4 py-24 sm:px-6 md:h-screen md:py-0">
            <div class="mb-8 text-center md:mb-10">
                <h2 class="mb-2 text-2xl sm:text-3xl font-bold">
                    {{ $t('page.landing.features.title') }}
                </h2>
                <p class="text-sm text-autumn-text-secondary sm:text-base">
                    {{ $t('page.landing.features.subtitle') }}
                </p>
            </div>

            <div class="grid w-full max-w-5xl grid-cols-1 gap-4 sm:gap-6 md:grid-cols-3">
                <CardFeature 
                    v-for="feature in localizedFeatures" 
                    :key="feature.title" 
                    
                    v-bind="feature" 
                />
            </div>
        </section>

        <section id="examples" class="flex min-h-svh items-center justify-center px-4 py-24 sm:px-6 md:h-screen md:py-0">
            <div class="flex w-full max-w-6xl flex-col gap-12 md:gap-16">
                <div class="grid items-center gap-8 md:grid-cols-2 md:gap-10">
                    <div class="text-center md:text-left">
                        <h2 class="mb-4 text-2xl sm:text-3xl font-bold">
                            {{ $t('page.landing.example.0.title') }}
                        </h2>

                        <p class="text-autumn-text-secondary">
                            {{ $t('page.landing.example.0.subtitle') }}
                        </p>
                    </div>

                    <DocumentationCode :tabs="codeExamplesController" />
                </div>

                <div class="grid items-center gap-8 md:grid-cols-2 md:gap-10">
                    <DocumentationCode :tabs="codeExampleDependencyInjection" />

                    <div class="text-center md:text-left">
                        <h2 class="mb-4 text-2xl sm:text-3xl font-bold">
                            {{ $t('page.landing.example.1.title') }}                            
                        </h2>

                        <p class="text-autumn-text-secondary">
                            {{ $t('page.landing.example.1.subtitle') }}                            
                        </p>

                        <LinkText to="/documentation">
                            {{ $t('common.examples') }} <ArrowRight :size="16" class="ml-1" />
                        </LinkText>
                    </div>
                </div>
            </div>
        </section>

        <section id="benchmark" class="flex min-h-svh items-center justify-center px-4 py-24 sm:px-6 md:h-screen md:py-0">
            <div class="flex w-full max-w-6xl flex-col gap-10">
                <div>
                    <div class="mb-8 text-center">
                        <h2 class="mb-2 text-2xl sm:text-3xl font-bold">
                            {{ $t('page.landing.marketing.title') }}   
                        </h2>
                        <p class="text-autumn-text-secondary max-w-lg mx-auto">
                            {{ $t('page.landing.marketing.subtitle') }}  
                        </p>
                    </div>

                    <div class="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-3">
                        <CardBetterThan
                            v-for="card in localizedComparision"
                            :key="card.title"

                            v-bind="card"
                        />
                    </div>
                </div>

                <CardBenchmarks />
            </div>
        </section>

        <section id="documentation" class="flex min-h-svh items-center justify-center px-4 py-24 sm:px-6 md:h-screen md:py-0">
            <div class="w-full max-w-7xl">
                <div class="mb-10 text-center md:mb-12">
                    <h2 class="mb-4 text-2xl sm:text-3xl font-bold">{{ $t('page.landing.documentation.title') }}</h2>
                </div>
                
                <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <CardDocumentation 
                        v-for="card in localizedDocumentation" 
                        :key="card.title"
                    
                        v-bind="card"
                    />
                </div>
            </div>
        </section>
    </div>
</template>

<script setup lang="ts">
    import { Leaf, Github, ArrowRight, ChevronDown } from 'lucide-vue-next'
    
    import { features, comparision, documentation } from '~/data/landing'

    const router = useRouter()
    const config = useRuntimeConfig()
    const { t } = useI18n()
    const isDesktop = useMediaQuery('(min-width: 768px)')
    const localePath = useLocalePath()

    const name = config.public.name
    const version = config.public.version
    const github = config.public.github
    const siteName = `${config.public.name} Framework`

    useHead(() => ({
        title : t('seo.home.title'),
        meta  : [
            { name : 'description', content : t('seo.home.description') },
            { property : 'og:title', content : t('seo.home.social_title') || siteName },
            { property : 'og:description', content : t('seo.home.social_description') },
            { name : 'twitter:title', content : t('seo.home.social_title') || siteName },
            { name : 'twitter:description', content : t('seo.home.social_description') }
        ]
    }))

    const isScrolling = ref(false)

    const getSections = (): HTMLElement[] => Array.from(document.querySelectorAll('section'))

    const getCurrentIndex = (): number => {
        const sections = getSections()

        return sections.findIndex(section => {
            const rect = section.getBoundingClientRect()

            return rect.top >= 0 && rect.top < window.innerHeight / 2
        })
    }

    const scrollToIndex = (index: number) => {
        const sections = getSections()
        const target = sections[index]

        if(!target) 
            return

        isScrolling.value = true

        target.scrollIntoView({
            behavior : 'smooth',
            block    : 'start'
        })

        setTimeout(() => isScrolling.value = false, 900)
    }

    const handleWheel = (event: WheelEvent) => {
        if(!isDesktop.value)
            return

        if(isScrolling.value) {
            event.preventDefault()
            return
        }

        const sections = getSections()
        const current = getCurrentIndex()

        if(current === -1) 
            return

        if(event.deltaY > 30 && current < sections.length - 1) {
            event.preventDefault()
            scrollToIndex(current + 1)
        }

        if(event.deltaY < -30 && current > 0) {
            event.preventDefault()
            scrollToIndex(current - 1)
        }
    }

    onMounted(() => window.addEventListener('wheel', handleWheel, { passive : false }))
    onUnmounted(() => window.removeEventListener('wheel', handleWheel))

    /* =========================
                DATA
    ========================= */
    const localizedFeatures = computed(() => features.map(record => ({
        ...record,
        title       : t(record.title),
        description : t(record.description)
    })))
    const localizedComparision = computed(() => comparision.map(record => ({
        ...record,
        title       : t(record.title),
        description : t(record.description)
    })))
    const localizedDocumentation = computed(() => documentation.map(record => ({
        ...record,
        title       : t(record.title),
        description : t(record.description)
    })))

    const codeExamplesController = [
        {
            name : 'controllers/user.py',
            lang : 'python',
            code : `from autumn.controller import REST, get
from autumn.response import JSONResponse
            
@REST(prefix = '/users')
class UserController:
    @get('/')
    async def get_users(self) -> JSONResponse:
        return JSONResponse([
            { 'id' : 0, 'name' : 'Gilfoyle' },
            { 'id' : 0, 'name' : 'Dinesh' }
        ])`
        },    
        {
            name : 'app.py',
            lang : 'python',
            code : `from autumn import Autumn

import uvicorn

app = Autumn(
    name    = 'Pied Piper Employees',
    version = 'v0.1.0'
)

if __name__ == '__main__':
    uvicorn.run(app)`
        }
    ]

    const codeExampleDependencyInjection = [
        {
            name : 'services/employee.py',
            lang : 'python',
            code : `@service
class EmployeesService:
    def __init__(self, database: DBClient):
        self.database = database

    async def get_employees(self) -> list[dict]:
        return await self.database.query("""
            SELECT *
            FROM employees
        """)`
        },
        {
            name : 'controllers/employee.py',
            lang : 'python',
            code : `@REST()
class EmployeesController:
    def __init__(self, service: EmployeesService):
        self.service = service

    @get('/')
    async def get_employees(self) -> JSONResponse:        
        return JSONResponse(
            await self.service.get_employees()
        )`
        }
    ]
</script>
