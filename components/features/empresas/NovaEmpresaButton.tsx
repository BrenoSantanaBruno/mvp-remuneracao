
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
import type { Empresa } from '@/types'

const Schema = z.object({
  name: z.string().min(2, 'Informe o nome'),
  fantasia: z.string().min(2, 'Informe a fantasia'),
  cnpj: z.string().min(11, 'CNPJ inválido'),
  code: z.string().optional(),
  status: z.string().optional()
})
type Form = z.infer<typeof Schema>

export function NovaEmpresaButton({ onCreated }:{ onCreated:(e:Empresa)=>void }){
  const [open, setOpen] = useState(false)
  const { toast } = useToast()
  const { register, handleSubmit, reset, formState:{ isSubmitting, errors } } = useForm<Form>({ resolver: zodResolver(Schema) })
  async function onSubmit(values: Form){
    try {
      const criado = await postJSON<Empresa, Form>('/api/empresas', values)
      onCreated(criado)
      toast({ title:'Empresa criada com sucesso' })
      reset(); setOpen(false)
    } catch (e:any){
      toast({ title:'Erro ao criar empresa', description: String(e), variant:'destructive' })
    }
  }
  return (<>
    <Button size="sm" onClick={()=>setOpen(true)}>+ Nova Empresa</Button>
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader><DialogTitle>Nova Empresa</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div><Label>Razão Social</Label><Input {...register('name')} /></div>
          <div><Label>Nome Fantasia</Label><Input {...register('fantasia')} /></div>
          <div><Label>CNPJ</Label><Input {...register('cnpj')} /></div>
          <div className="grid grid-cols-2 gap-2">
            <div><Label>Código</Label><Input {...register('code')} /></div>
            <div><Label>Status</Label><Input {...register('status')} placeholder="ativa/inativa" /></div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={()=>setOpen(false)}>Cancelar</Button>
            <Button type="submit" disabled={isSubmitting}>Salvar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  </>)
}
