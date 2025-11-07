
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

const Schema = z.object({ nome: z.string().min(2), codigo: z.string().optional() })
type Form = z.infer<typeof Schema>

export function NovoGenericoButton({ entity, onCreated }:{ entity:'estabelecimentos'|'lotacoes'|'centros'|'unidades', onCreated:(i:any)=>void }){
  const [open, setOpen] = useState(false)
  const { toast } = useToast()
  const { register, handleSubmit, reset, formState:{ isSubmitting } } = useForm<Form>({ resolver: zodResolver(Schema) })
  async function onSubmit(values: Form){
    try { const criado = await postJSON(`/api/${entity}`, values); onCreated(criado); toast({ title:'Criado com sucesso' }); reset(); setOpen(false) }
    catch(e:any){ toast({ title:'Erro ao criar', description:String(e), variant:'destructive' }) }
  }
  return (<>
    <Button size="sm" onClick={()=>setOpen(true)}>+ Novo</Button>
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[460px]">
        <DialogHeader><DialogTitle>Novo registro ({entity})</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div><Label>Nome</Label><Input {...register('nome')} /></div>
          <div><Label>Código</Label><Input {...register('codigo')} /></div>
          <DialogFooter><Button type="button" variant="outline" onClick={()=>setOpen(false)}>Cancelar</Button><Button type="submit" disabled={isSubmitting}>Salvar</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  </>)
}
