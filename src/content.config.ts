import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const simulacoes = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/simulacoes' }),
  schema: z.object({
    titulo: z.string(),
    descricao: z.string(),
    disciplina: z.enum(['fisica', 'matematica']),
    // Ex.: "1º ano EM", "9º ano EF"
    serie: z.string().optional(),
    tags: z.array(z.string()).default([]),
    rascunho: z.boolean().default(false),
  }),
});

export const collections = { simulacoes };
