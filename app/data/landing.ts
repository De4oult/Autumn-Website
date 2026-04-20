import {
    Box,
    Zap,
    Settings,
    Layers,
    Wifi,
    FileText,
    Terminal,
    BookOpen,
    Code
} from 'lucide-vue-next';

export const features = [
    { 
        icon        : Zap, 
        title       : 'data.features.api.title', 
        description : 'data.features.api.description' 
    },
    { 
        icon        : Box, 
        title       : 'data.features.di.title', 
        description : 'data.features.di.description' 
    },
    { 
        icon        : Settings, 
        title       : 'data.features.configuration.title', 
        description : 'data.features.configuration.description' 
    },
    { 
        icon        : Layers, 
        title       : 'data.features.hooks.title', 
        description : 'data.features.hooks.description' 
    },
    { 
        icon        : Wifi, 
        title       : 'data.features.websocket.title', 
        description : 'data.features.websocket.description' 
    },
    { 
        icon        : FileText, 
        title       : 'data.features.documentation.title', 
        description : 'data.features.documentation.description' 
    }
];

export const comparision = [
    {
        title       : 'data.comparision.0.title',
        description : 'data.comparision.0.description'
    },
    {
        title       : 'data.comparision.1.title',
        description : 'data.comparision.1.description'
    },
    {
        title       : 'data.comparision.2.title',
        description : 'data.comparision.2.description'
    }
];

export const documentation = [
    {
        icon        : Terminal,
        title       : 'data.documentation.get_started.title',
        description : 'data.documentation.get_started.description',
        to          : '/documentation/get-started'
    },
    {
        icon        : BookOpen,
        title       : 'data.documentation.concepts.title',
        description : 'data.documentation.concepts.description',
        to          : '/documentation/concepts'
    },
    {
        icon        : Code,
        title       : 'data.documentation.examples.title',
        description : 'data.documentation.examples.description',
        to          : '/documentation/examples'
    },
    {
        icon        : FileText,
        title       : 'data.documentation.documentation.title',
        description : 'data.documentation.documentation.description',
        to          : '/documentation/reference'
    }
];


interface Benchmark {
    name : string;
    rps : number;
}

export const rawBenchmarks: Benchmark[] = [
    {
        name : 'Falcon',
        rps  : 4471
    },
    { 
        name : 'Autumn', 
        rps  : 4006
    },
    { 
        name : 'FastAPI', 
        rps  : 3644
    },
    { 
        name : 'Flask', 
        rps  : 2149
    }
];