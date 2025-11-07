"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { postJSON } from "@/lib/api";
import type { Funcionario } from "@/types";

const Schema = z.object({
    nome: z.string().min(2),
    cargo: z.string().min(2),
    area: z.string().min(2),
    gestor: z.string().min(2),
    admissao: z.string().min(8), // yyyy-mm-dd
    salario: z.coerce.number().nonnegative(),
    status: z.enum(["ativo","afastado","desligado"]).default("ativo"),
});
type Form = z.infer<typeof Schema>;

export function NovoFuncionarioButton({ onCreated }:{ onCreated:(f:Funcionario)=>void }){
    const [open, setOpen] = useState(false);
    const { toast } = useToast();
    const { register, handleSubmit, reset, formState:{ isSubmitting } } =
        useForm<Form>({ resolver:zodResolver(Schema), defaultValues:{ status:"ativo" } });

    async function onSubmit(values: Form){
        try{
            const f = await postJSON<Funcionario,Form>("/api/funcionarios", values);
            onCreated(f);
            toast({ title:"Funcionário criado" });
            reset();
            setOpen(false);
        }catch{
            toast({ variant:"destructive", title:"Falha ao criar funcionário" });
        }
    }

    return (
        <>
            <Button onClick={()=>setOpen(true)}>Novo Funcionário</Button>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-[520px]">
                    <DialogHeader><DialogTitle>Novo Funcionário</DialogTitle></DialogHeader>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
                        <div className="grid grid-cols-2 gap-2">
                            <div><Label>Nome</Label><Input {...register("nome")} /></div>
                            <div><Label>Cargo</Label><Input {...register("cargo")} /></div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div><Label>Área</Label><Input {...register("area")} /></div>
                            <div><Label>Gestor</Label><Input {...register("gestor")} /></div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div><Label>Admissão</Label><Input {...register("admissao")} placeholder="YYYY-MM-DD" /></div>
                            <div><Label>Salário</Label><Input type="number" step="0.01" {...register("salario")} /></div>
                        </div>
                        <div><Label>Status</Label><Input {...register("status" as const)} placeholder="ativo/afastado/desligado" /></div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={()=>setOpen(false)}>Cancelar</Button>
                            <Button type="submit" disabled={isSubmitting}>Salvar</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}
