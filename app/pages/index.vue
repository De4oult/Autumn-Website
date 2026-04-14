<template>
    <div class="bg-autumn-bg text-autumn-text">
        <section id="hero" class="h-screen flex flex-col items-center justify-center text-center relative px-4">
            <Leaf class="w-16 h-16 text-autumn-accent mb-6" />
            
            <h1 class="text-6xl font-bold mb-3">
                {{ name }}
            </h1>
            
            <Badge class="mb-5"> 
                {{ $t('page.landing.hero.version', { version })}}
            </Badge>

            <p class="text-xl text-autumn-text-secondary mb-10 max-w-xl">
                {{ $t('page.landing.hero.about')}}
                <br>
                {{ $t('page.landing.hero.personality')}}
            </p>

            <div class="flex gap-4 justify-center">
                <ButtonPrimary
                    size="lg" 
                    
                    @click="() => router.push('/documentation/get-started')" 
                >
                    {{ $t('common.cta') }}
                </ButtonPrimary>
                
                <ButtonLink :href="github">
                    <Github :size="20" class="inline mr-2" />
                    GitHub
                </ButtonLink>
            </div>

            <div
                @click="scrollToIndex(1)"
                class="absolute bottom-10 flex flex-col items-center gap-2 text-autumn-text-muted animate-pulse cursor-pointer"
            >
                <span class="text-xs">scroll</span>
                <ChevronDown :size="20" class="animate-bounce" />
            </div>
        </section>

        <section id="features" class="h-screen flex flex-col items-center justify-center px-4">
            <div class="text-center mb-10">
                <h2 class="text-3xl font-bold mb-2">
                    {{ $t('page.landing.features.title') }}
                </h2>
                <p class="text-autumn-text-secondary">
                    {{ $t('page.landing.features.subtitle') }}
                </p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full">
                <CardFeature 
                    v-for="feature in localizedFeatures" 
                    :key="feature.title" 
                    
                    v-bind="feature" 
                />
            </div>
        </section>

        <section class="h-screen flex items-center justify-center px-4">
            <div class="flex flex-col gap-16 max-w-6xl w-full">
                <div class="grid md:grid-cols-2 gap-10 items-center">
                    <div>
                        <h2 class="text-3xl font-bold mb-4">
                            {{ $t('page.landing.example.0.title') }}
                        </h2>

                        <p class="text-autumn-text-secondary">
                            {{ $t('page.landing.example.0.subtitle') }}
                        </p>
                    </div>

                    <DocumentationCode :tabs="codeExamplesController" />
                </div>

                <div class="grid md:grid-cols-2 gap-10 items-center">
                    <DocumentationCode :tabs="codeExampleDependencyInjection" />

                    <div>
                        <h2 class="text-3xl font-bold mb-4">
                            {{ $t('page.landing.example.1.title') }}                            
                        </h2>

                        <p class="text-autumn-text-secondary">
                            {{ $t('page.landing.example.1.subtitle') }}                            
                        </p>

                        <LinkText to="/documentation/examples">
                            {{ $t('common.examples') }} <ArrowRight :size="16" class="ml-1" />
                        </LinkText>
                    </div>
                </div>
            </div>
        </section>

        <section class="h-screen flex items-center justify-center px-4">
            <div class="max-w-6xl w-full flex flex-col gap-10">
                <div>
                    <div class="text-center mb-8">
                        <h2 class="text-3xl font-bold mb-2">
                            {{ $t('page.landing.marketing.title') }}   
                        </h2>
                        <p class="text-autumn-text-secondary max-w-lg mx-auto">
                            {{ $t('page.landing.marketing.subtitle') }}  
                        </p>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
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

        <section class="h-screen flex items-center justify-center px-4">
            <div class="max-w-7xl w-full">
                <div class="text-center mb-12">
                    <h2 class="text-3xl font-bold mb-4">{{ $t('page.landing.documentation.title') }}</h2>
                </div>
                
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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

    const name = config.public.name
    const version = config.public.version
    const github = config.public.github

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