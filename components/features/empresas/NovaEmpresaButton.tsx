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
  name: z.string().min(2, 'Informe a razão social'),
  fantasia: z.string().min(2, 'Informe o nome fantasia'),
  code: z.string().optional(),
  status: z.string().optional()
})
type Form = z.infer<typeof Schema>

export function NovaEmpresaButton({ onCreated }:{ onCreated:(e:Empresa)=>void }){
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const { register, handleSubmit, formState:{ errors }, reset } = useForm<Form>({ resolver:zodResolver(Schema) })

  const onSubmit = async (data:Form)=>{
    try{
      const created = await postJSON<Empresa>('/api/empresas', data)
      onCreated(created)
      toast({ title:'Empresa criada' })
      reset()
      setOpen(false)
    }catch(e:any){
      toast({ title:'Erro ao criar empresa', description:String(e), variant:'destructive' })
    }
  }

  return (
    <>
      <Button onClick={()=>setOpen(true)}>Nova Empresa</Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>Nova Empresa</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
            <div>
              <Label>Razão Social</Label>
              <Input {...register('name')} />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <Label>Nome Fantasia</Label>
              <Input {...register('fantasia')} />
              {errors.fantasia && <p className="text-red-500 text-xs mt-1">{errors.fantasia.message}</p>}
            </div>
            <div>
              <Label>Código</Label>
              <Input {...register('code')} />
            </div>
            <DialogFooter className="pt-4">
              <Button type="submit">Salvar</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
