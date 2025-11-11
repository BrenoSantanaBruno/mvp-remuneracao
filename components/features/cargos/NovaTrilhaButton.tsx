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

const Schema = z.object({ nome: z.string().min(2), area: z.string().min(2) })
type Form = z.infer<typeof Schema>

export default function NovaTrilhaButton({ onCreated }:{ onCreated:(t:any)=>void }){
  const [open, setOpen] = useState(false)
  const { toast } = useToast()
  const { register, handleSubmit, formState:{ isSubmitting }, reset } = useForm<Form>({
    resolver: zodResolver(Schema)
  })

  async function onSubmit(values:Form){
    try{
      const t = await postJSON('/api/trilhas', values)
      onCreated(t)
      toast({ title:'Trilha criada' })
      reset(); setOpen(false)
    }catch(e:any){
      toast({ title:'Erro ao criar trilha', description:String(e), variant:'destructive' })
    }
  }

  return (<>
    <Button variant="secondary" onClick={()=>setOpen(true)}>+ Nova Trilha</Button>
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader><DialogTitle>Nova Trilha</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div><Label>Nome</Label><Input {...register('nome')} /></div>
          <div><Label>Área</Label><Input {...register('area')} /></div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={()=>setOpen(false)}>Cancelar</Button>
            <Button type="submit" disabled={isSubmitting}>Salvar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  </>)
}