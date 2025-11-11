"use client"
import { useEffect, useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { postJSON, getJSON } from "@/lib/api"
import type { Funcionario } from "@/types"

const Schema = z.object({
    nome: z.string().min(2),
    cargo: z.string().min(1, "Selecione um cargo"),
    area: z.string().min(1),
    gestor: z.string().optional().default(""),
    admissao: z.string().min(4, "Defina a data"),
    salario: z.coerce.number().min(0),
    status: z.enum(["ativo","ferias","inativo"]).default("ativo"),
})
type Form = z.infer<typeof Schema>

export default function NovoFuncionarioButton({ onCreated }:{ onCreated: (f:Funcionario)=>void }) {
    const [open, setOpen] = useState(false)
    const [cargosOpts, setCargosOpts] = useState<any[]>([])
    const { toast } = useToast()

    const { register, handleSubmit, control, formState:{ isSubmitting, errors }, reset, setValue } = useForm<Form>({
        resolver: zodResolver(Schema),
        defaultValues: { status: "ativo" },
    })

    useEffect(() => {
        getJSON<any[]>("/api/cargos")
            .then(list => {
                setCargosOpts(list || [])
                if (list?.length) setValue("cargo", list[0].titulo, { shouldValidate: true })
            })
            .catch(()=>{})
    }, [setValue])

    async function onSubmit(values: Form){
        try{
            const f = await postJSON<Funcionario, Form>("/api/funcionarios", values)
            onCreated(f)
            toast({ title: "Funcionário criado" })
            reset(); setOpen(false)
        }catch(e:any){
            toast({ variant: "destructive", title: "Falha ao criar funcionário", description: String(e) })
        }
    }
    function onError(){
        const faltando = Object.keys(errors).join(", ")
        toast({ variant:"destructive", title:"Verifique os campos", description: faltando || "Campos obrigatórios ausentes" })
    }

    return (
        <>
            <Button onClick={()=>setOpen(true)}>Novo Funcionário</Button>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-[560px]">
                    <DialogHeader>
                        <DialogTitle>Novo Funcionário</DialogTitle>
                    </DialogHeader>

                    <form onSubmit={handleSubmit(onSubmit, onError)} className="space-y-3">
                        <div className="grid grid-cols-2 gap-2">
                            <div><Label>Nome</Label><Input {...register("nome")} /></div>

                            <div>
                                <Label>Cargo</Label>
                                <Controller
                                    control={control}
                                    name="cargo"
                                    render={({ field }) => (
                                        <Select value={field.value} onValueChange={field.onChange}>
                                            <SelectTrigger><SelectValue placeholder="Selecione o cargo" /></SelectTrigger>
                                            <SelectContent>
                                                {(cargosOpts||[]).map((c:any)=>(
                                                    <SelectItem key={c.id} value={c.titulo}>{c.titulo}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <div><Label>Área</Label><Input {...register("area")} /></div>
                            <div><Label>Gestor</Label><Input {...register("gestor")} /></div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <div><Label>Admissão</Label><Input type="date" {...register("admissao" as const)} /></div>
                            <div><Label>Salário</Label><Input type="number" step="0.01" {...register("salario" as const)} /></div>
                        </div>

                        <div>
                            <Label>Status</Label>
                            <Controller
                                control={control}
                                name="status"
                                render={({ field }) => (
                                    <Select value={field.value} onValueChange={field.onChange}>
                                        <SelectTrigger><SelectValue placeholder="Selecione o status" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="ativo">Ativo</SelectItem>
                                            <SelectItem value="ferias">Férias</SelectItem>
                                            <SelectItem value="inativo">Inativo</SelectItem>
                                        </SelectContent>
                                    </Select>
                                )}
                            />
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
