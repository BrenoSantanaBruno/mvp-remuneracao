'use client'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { getJSON, postJSON } from '@/lib/api'
import type { TabelaSalarial } from '@/types'

const Schema = z.object({
    nome: z.string().min(2),
    cargo: z.string().min(1),
    faixaMin: z.coerce.number(),
    faixaMed: z.coerce.number(),
    faixaMax: z.coerce.number(),
    moeda: z.enum(['BRL','USD','EUR']).default('BRL'),
})
type Form = z.infer<typeof Schema>

export default function NovaTabelaSalarialButton({ onCreated }: { onCreated?: (t: TabelaSalarial) => void }) {
    const [open, setOpen] = useState(false)
    const [cargos, setCargos] = useState<any[]>([])
    const { toast } = useToast()

    const { register, handleSubmit, formState:{ isSubmitting }, reset, setValue } = useForm<Form>({
        resolver: zodResolver(Schema),
        defaultValues: { moeda: 'BRL' },
    })

    useEffect(() => { getJSON<any[]>('/api/cargos').then(setCargos).catch(()=>{}) }, [])

    async function onSubmit(values: Form) {
        try {
            const criado = await postJSON<TabelaSalarial, Form>('/api/tabelas', values)
            onCreated?.(criado)
            toast({ title: 'Tabela criada' })
            reset(); setOpen(false)
        } catch (e:any) {
            toast({ title: 'Erro ao criar tabela', description: String(e), variant: 'destructive' })
        }
    }

    return (
        <>
            <Button variant="outline" onClick={() => setOpen(true)}>Criar Tabela Salarial</Button>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-[560px]">
                    <DialogHeader><DialogTitle>Nova Tabela Salarial</DialogTitle></DialogHeader>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
                        <div><Label>Nome</Label><Input {...register('nome')} /></div>

                        <div>
                            <Label>Cargo</Label>
                            <input type="hidden" {...register('cargo' as const)} />
                            <Select onValueChange={(v)=>{ (register('cargo').onChange as any)({ target:{ value:v }}) }}>
                                <SelectTrigger><SelectValue placeholder="Selecione o cargo" /></SelectTrigger>
                                <SelectContent>
                                    {cargos.map((c:any)=>(
                                        <SelectItem key={c.id} value={c.titulo}>{c.titulo}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                            <div><Label>Min</Label><Input type="number" step="0.01" {...register('faixaMin')} /></div>
                            <div><Label>Med</Label><Input type="number" step="0.01" {...register('faixaMed')} /></div>
                            <div><Label>Max</Label><Input type="number" step="0.01" {...register('faixaMax')} /></div>
                        </div>

                        <div>
                            <Label>Moeda</Label>
                            <input type="hidden" {...register('moeda' as const)} />
                            <Select defaultValue="BRL" onValueChange={(v)=>{ (register('moeda').onChange as any)({ target:{ value:v }}) }}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="BRL">BRL</SelectItem>
                                    <SelectItem value="USD">USD</SelectItem>
                                    <SelectItem value="EUR">EUR</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={()=>setOpen(false)}>Cancelar</Button>
                            <Button type="submit" disabled={isSubmitting}>Salvar</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    )
}
