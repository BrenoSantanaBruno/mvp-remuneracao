
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
import type { Cargo } from '@/types'

const Schema = z.object({
  titulo: z.string().min(2),
  area: z.string().min(2),
  nivel: z.enum(['Júnior','Pleno','Sênior']).default('Júnior'),
  pontos: z.coerce.number().int().nonnegative()
})
type Form = z.infer<typeof Schema>

export function NovoCargoButton({ onCreated }:{ onCreated:(c:Cargo)=>void }){
  const [open, setOpen] = useState(false)
  const { toast } = useToast()
  const { register, handleSubmit, reset, formState:{ isSubmitting } } = useForm<Form>({
    resolver: zodResolver(Schema),
    defaultValues: { nivel: 'Júnior', pontos: 0 }
  })
  async function onSubmit(values: Form){
    try {
      const criado = await postJSON<Cargo, Form>('/api/cargos', values)
      onCreated(criado)
      toast({ title:'Cargo criado' })
      reset(); setOpen(false)
    } catch (e:any){
      toast({ title:'Erro ao criar cargo', description:String(e), variant:'destructive' })
    }
  }
  return (<>
    <Button onClick={()=>setOpen(true)}>Novo Cargo</Button>
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader><DialogTitle>Novo Cargo</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div><Label>Título</Label><Input {...register('titulo')} /></div>
          <div><Label>Área</Label><Input {...register('area')} /></div>
          <div className="grid grid-cols-2 gap-2">
            <div><Label>Nível</Label><input type='hidden' {...register('nivel' as const)} />
              <Select onValueChange={(v)=>{ (register('nivel').onChange as any)({ target:{ value:v }}) }}>
                <SelectTrigger><SelectValue placeholder="Selecione o nível" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Júnior">Júnior</SelectItem>
                  <SelectItem value="Pleno">Pleno</SelectItem>
                  <SelectItem value="Sênior">Sênior</SelectItem>
                </SelectContent>
              </Select></div>
            <div><Label>Pontos</Label><Input type="number" {...register('pontos' as const)} /></div>
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
