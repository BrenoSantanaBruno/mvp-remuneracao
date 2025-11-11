
'use client'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { postJSON } from '@/lib/api'
import type { Empresa } from '@/types'

function maskCNPJ(v:string){ const d=v.replace(/\D/g,'').slice(0,14); const p=[2,5,8,12]; let r=''; for(let i=0,j=0;i<d.length;i++){ r+=d[i]; if(p.includes(i)) r+=(['.','.','/','-'][j++]); } return r; }

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
          <div>
      <Label>CNPJ</Label>
      <Input {...register('cnpj')} onChange={(e)=>{ e.target.value = maskCNPJ(e.target.value); (register('cnpj').onChange as any)(e) }} placeholder="00.000.000/0000-00" />
    </div>
          <div className="grid grid-cols-2 gap-2">
            <div><Label>Código</Label><Input {...register('code')} /></div>
            <div>
      <Label>Status</Label>
      <Select onValueChange={(v)=>{ (register('status').onChange as any)({ target:{ value:v }}) }}>
        <SelectTrigger><SelectValue placeholder="Selecione o status" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="ativa">Ativa</SelectItem>
          <SelectItem value="inativa">Inativa</SelectItem>
        </SelectContent>
      </Select>
    </div>
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
