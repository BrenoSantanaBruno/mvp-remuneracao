'use client'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { postJSON, getJSON } from '@/lib/api'
import type { Cargo, CentroCusto } from '@/types'

const Schema = z.object({
  titulo: z.string().min(2),
  area: z.string().min(1, 'Selecione o centro de custo'),
  nivel: z.enum(['Júnior','Pleno','Sênior']),
  pontos: z.coerce.number().min(0)
})
type Form = z.infer<typeof Schema>

export default function NovoCargoButton({ onCreated }:{ onCreated:(c:Cargo)=>void }){
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const { register, handleSubmit, formState:{ errors }, reset, setValue, watch } = useForm<Form>({ resolver:zodResolver(Schema) })
  const [centros, setCentros] = useState<CentroCusto[]>([])

  useEffect(()=>{
    getJSON<CentroCusto[]>('/api/centros').then(setCentros).catch(()=>setCentros([]))
  },[])

  const onSubmit = async (data:Form)=>{
    try{
      const created = await postJSON<Cargo>('/api/cargos', data)
      onCreated(created)
      toast({ title:'Cargo criado' })
      reset()
      setOpen(false)
    }catch(e:any){
      toast({ title:'Erro ao criar cargo', description:String(e), variant:'destructive' })
    }
  }

  return (
    <>
      <Button onClick={()=>setOpen(true)}>Novo Cargo</Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader><DialogTitle>Novo Cargo</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
            <div>
              <Label>Título</Label>
              <Input {...register('titulo')} />
              {errors.titulo && <p className="text-red-500 text-xs mt-1">{errors.titulo.message}</p>}
            </div>
            <div>
              <Label>Centro de Custo</Label>
              <Select onValueChange={(v)=>setValue('area', v)}>
                <SelectTrigger><SelectValue placeholder="Selecione o centro" /></SelectTrigger>
                <SelectContent>
                  {centros.filter(c=>c.ativo !== false).map(c=>(
                    <SelectItem key={c.id} value={c.codigo || String(c.id)}>
                      {c.codigo ? c.codigo + ' - ' + (c.descricao || '') : (c.descricao || 'Centro '+c.id)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.area && <p className="text-red-500 text-xs mt-1">{errors.area.message}</p>}
            </div>
            <div>
              <Label>Nível</Label>
              <select className="border rounded px-2 py-1 w-full" {...register('nivel')}>
                <option value="Júnior">Júnior</option>
                <option value="Pleno">Pleno</option>
                <option value="Sênior">Sênior</option>
              </select>
            </div>
            <div>
              <Label>Pontos</Label>
              <Input type="number" {...register('pontos', { valueAsNumber:true })} />
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
