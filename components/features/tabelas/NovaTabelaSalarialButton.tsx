
'use client'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { postJSON } from '@/lib/api'
import type { TabelaSalarial } from '@/types'

const Schema = z.object({
  nome: z.string().min(2),
  cargo: z.string().min(2),
  faixaMin: z.coerce.number(),
  faixaMed: z.coerce.number(),
  faixaMax: z.coerce.number(),
  moeda: z.string().default('BRL')
})
type Form = z.infer<typeof Schema>

export function NovaTabelaSalarialButton({ onCreated }:{ onCreated:(t:TabelaSalarial)=>void }){
  const [open, setOpen] = useState(false)
  const { toast } = useToast()
  const { register, handleSubmit, reset, formState:{ isSubmitting } } = useForm<Form>({ resolver: zodResolver(Schema), defaultValues:{ moeda:'BRL' } })
  async function onSubmit(values: Form){
    try { const criado = await postJSON<TabelaSalarial, Form>('/api/tabelas', values); onCreated(criado); toast({ title:'Tabela criada' }); reset(); setOpen(false) }
    catch(e:any){ toast({ title:'Erro ao criar tabela', description:String(e), variant:'destructive' }) }
  }
  return (<>
    <Button variant="outline" onClick={()=>setOpen(true)}>Criar Tabela Salarial</Button>
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader><DialogTitle>Nova Tabela Salarial</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div><Label>Nome</Label><Input {...register('nome')} /></div>
          <div><Label>Cargo</Label><Input {...register('cargo')} /></div>
          <div className="grid grid-cols-3 gap-2">
            <div><Label>Min</Label><Input type="number" step="0.01" {...register('faixaMin' as const)} /></div>
            <div><Label>Med</Label><Input type="number" step="0.01" {...register('faixaMed' as const)} /></div>
            <div><Label>Max</Label><Input type="number" step="0.01" {...register('faixaMax' as const)} /></div>
          </div>
          <div><Label>Moeda</Label><Input {...register('moeda' as const)} placeholder="BRL/USD/EUR" /></div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={()=>setOpen(false)}>Cancelar</Button>
            <Button type="submit" disabled={isSubmitting}>Salvar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  </>)
}
