
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

const Schema = z.object({ cargo: z.string().min(1), nota: z.coerce.number().min(1).max(5), comentario: z.string().optional() })
type Form = z.infer<typeof Schema>

export function AvaliarCargoButton(){
  const [open, setOpen] = useState(false)
  const { toast } = useToast()
  const { register, handleSubmit, formState:{ isSubmitting } } = useForm<Form>({ resolver: zodResolver(Schema), defaultValues:{ nota:3 } })
  async function onSubmit(values: Form){
    try { await postJSON('/api/avaliacoes-cargo', values); toast({ title:'Avaliação salva' }); setOpen(false) }
    catch(e:any){ toast({ title:'Erro ao avaliar', description:String(e), variant:'destructive' }) }
  }
  return (<>
    <Button variant="outline" onClick={()=>setOpen(true)}>Avaliar Cargo</Button>
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader><DialogTitle>Avaliar Cargo</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div><Label>Cargo</Label><Input {...register('cargo')} /></div>
          <div><Label>Nota (1..5)</Label><Input type="number" {...register('nota' as const)} /></div>
          <div><Label>Comentário</Label><Input {...register('comentario')} /></div>
          <DialogFooter><Button type="button" variant="outline" onClick={()=>setOpen(false)}>Cancelar</Button><Button type="submit" disabled={isSubmitting}>Salvar</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  </>)
}
