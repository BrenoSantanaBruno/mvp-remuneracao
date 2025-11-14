"use client"

import type React from "react"
import { useState, useEffect } from "react"

import { getJSON, delJSON } from "@/lib/api"
import { Toaster } from "@/components/ui/toaster"
import { downloadCSV } from "@/lib/csv"
import { onDataChanged } from "@/lib/events"

import { NovaEmpresaButton } from "@/components/features/empresas/NovaEmpresaButton"
import { NovoGenericoButton } from "@/components/features/generics/NovoGenericoButton"
import { NovoCargoButton } from "@/components/features/cargos/NovoCargoButton" // named export
import NovaTrilhaButton from "@/components/features/cargos/NovaTrilhaButton"
import NovoFuncionarioButton from "@/components/features/funcionarios/NovoFuncionarioButton"
import AvaliarCargoButton from "@/components/features/cargos/AvaliarCargoButton"
import NovaTabelaSalarialButton from "@/components/features/tabelas/NovaTabelaSalarialButton"

import type { Empresa, Cargo, Funcionario } from "@/types"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
    LayoutDashboard,
    Building2,
    Briefcase,
    Users,
    ClipboardCheck,
    Network,
    DollarSign,
    FileText,
    Download,
    Eye,
    Edit,
    ChevronRight,
    Trash,
} from "lucide-react"

type MenuItem =
    | "dashboard"
    | "estrutura"
    | "cargos"
    | "funcionarios"
    | "avaliacao"
    | "organograma"
    | "tabelas"
    | "relatorios"

export default function HRManagementSystem() {
    const [activeMenu, setActiveMenu] = useState<MenuItem>("dashboard")
    const [selectedTab, setSelectedTab] = useState("empresas")

    return (
        <div className="flex min-h-screen bg-[#F5F5F7]">
            {/* Sidebar */}
            <aside className="w-60 bg-white border-r border-gray-200 fixed h-full">
                <div className="p-6 border-b border-gray-200">
                    <h1 className="text-xl font-bold text-gray-900">C&S Manager</h1>
                    <p className="text-sm text-gray-500">Gestão de Cargos</p>
                </div>

                <nav className="p-4 space-y-1">
                    <MenuEntry
                        icon={<LayoutDashboard className="w-5 h-5" />}
                        label="Dashboard"
                        active={activeMenu === "dashboard"}
                        onClick={() => setActiveMenu("dashboard")}
                    />
                    <MenuEntry
                        icon={<Building2 className="w-5 h-5" />}
                        label="Estrutura Organizacional"
                        badge="Novo"
                        active={activeMenu === "estrutura"}
                        onClick={() => setActiveMenu("estrutura")}
                    />
                    <MenuEntry
                        icon={<Briefcase className="w-5 h-5" />}
                        label="Gestão de Cargos"
                        active={activeMenu === "cargos"}
                        onClick={() => setActiveMenu("cargos")}
                    />
                    <MenuEntry
                        icon={<Users className="w-5 h-5" />}
                        label="Funcionários"
                        active={activeMenu === "funcionarios"}
                        onClick={() => setActiveMenu("funcionarios")}
                    />
                    <MenuEntry
                        icon={<ClipboardCheck className="w-5 h-5" />}
                        label="Avaliação de Cargos"
                        active={activeMenu === "avaliacao"}
                        onClick={() => setActiveMenu("avaliacao")}
                    />
                    <MenuEntry
                        icon={<Network className="w-5 h-5" />}
                        label="Organograma"
                        active={activeMenu === "organograma"}
                        onClick={() => setActiveMenu("organograma")}
                    />
                    <MenuEntry
                        icon={<DollarSign className="w-5 h-5" />}
                        label="Tabelas Salariais"
                        active={activeMenu === "tabelas"}
                        onClick={() => setActiveMenu("tabelas")}
                    />
                    <MenuEntry
                        icon={<FileText className="w-5 h-5" />}
                        label="Relatórios"
                        active={activeMenu === "relatorios"}
                        onClick={() => setActiveMenu("relatorios")}
                    />
                </nav>
            </aside>

            {/* Main */}
            <main className="ml-60 flex-1">
                {/* Top Bar */}
                <div className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">
                            {activeMenu === "dashboard" && "Dashboard"}
                            {activeMenu === "estrutura" && "Estrutura Organizacional"}
                            {activeMenu === "cargos" && "Gestão de Cargos"}
                            {activeMenu === "funcionarios" && "Funcionários"}
                            {activeMenu === "avaliacao" && "Avaliação de Cargos"}
                            {activeMenu === "organograma" && "Organograma"}
                            {activeMenu === "tabelas" && "Tabelas Salariais"}
                            {activeMenu === "relatorios" && "Relatórios"}
                        </h2>
                    </div>
                    <div className="flex items-center gap-4">
                        <Badge variant="secondary" className="px-3 py-1">Plano Profissional</Badge>
                        <span className="text-sm text-gray-500">Dados salvos localmente</span>
                        <Avatar>
                            <AvatarFallback className="bg-blue-600 text-white">B</AvatarFallback>
                        </Avatar>
                    </div>
                </div>

                {/* Content */}
                <div className="p-8">
                    {activeMenu === "dashboard" && <DashboardPage />}
                    {activeMenu === "estrutura" && <EstruturaPage selectedTab={selectedTab} setSelectedTab={setSelectedTab} />}
                    {activeMenu === "cargos" && <CargosPage />}
                    {activeMenu === "funcionarios" && <FuncionariosPage />}
                    {activeMenu === "avaliacao" && <AvaliacaoPage />}
                    {activeMenu === "organograma" && <OrganogramaPage />}
                    {activeMenu === "tabelas" && <TabelasPage />}
                    {activeMenu === "relatorios" && <RelatoriosPage />}
                </div>
            </main>

            <Toaster />
        </div>
    )
}

function MenuEntry({
                       icon, label, badge, active, onClick,
                   }: { icon: React.ReactNode; label: string; badge?: string; active: boolean; onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                active ? "bg-gray-100 text-gray-900 border-l-4 border-blue-600" : "text-gray-600 hover:bg-gray-50"
            }`}
        >
            {icon}
            <span className="flex-1 text-left">{label}</span>
            {badge && <Badge variant="default" className="bg-blue-600 text-white text-xs">{badge}</Badge>}
        </button>
    )
}

/* ===================== DASHBOARD ===================== */
function DashboardPage() {
    const [cargos, setCargos] = useState<Cargo[]>([])
    const [funcionarios, setFuncionarios] = useState<Funcionario[]>([])
    const [avaliacoes, setAvaliacoes] = useState<any[]>([])

    const refetch = ()=>{
        getJSON<Cargo[]>("/api/cargos").then(setCargos).catch(()=>{})
        getJSON<Funcionario[]>("/api/funcionarios").then(setFuncionarios).catch(()=>{})
        getJSON<any[]>("/api/avaliacoes").then(setAvaliacoes).catch(()=>{})
    }

    useEffect(refetch, [])
    useEffect(()=>{ const u = onDataChanged(refetch); return u }, [])

    const aval = avaliacoes.length
    const pend = Math.max(0, cargos.length - aval)
    const ativos = funcionarios.filter(f=>f.status==='ativo').length
    const ferias = funcionarios.filter(f=>f.status==='ferias').length
    const folha = funcionarios.reduce((s,f)=> s + (Number(f.salario)||0), 0)
    const media = funcionarios.length ? Math.round(folha/funcionarios.length) : 0
    const novasContratacoes = funcionarios.filter(f=>{
        const d = f.admissao ? new Date(f.admissao) : null
        if(!d) return false
        return (Date.now() - d.getTime())/(1000*60*60*24) <= 90
    }).length

    return (
        <div className="space-y-6">
            <div><p className="text-gray-600">Sistema de Gestão de Cargos e Salários</p></div>

            <div className="grid grid-cols-4 gap-6">
                <SummaryCard title="Total de Cargos" value={String(cargos.length)} description={`${aval} avaliados, ${pend} pendentes`} />
                <SummaryCard title="Funcionários" value={String(funcionarios.length)} description={`${ativos} ativos, ${ferias} em férias`} />
                <SummaryCard title="Folha de Pagamento" value={`R$ ${folha.toLocaleString("pt-BR")}`} description={`Média: R$ ${media.toLocaleString("pt-BR")}`} />
                <SummaryCard title="Novas Contratações" value={String(novasContratacoes)} description="Últimos 3 meses" />
            </div>

            <div className="grid grid-cols-2 gap-6">
                <div className="space-y-6">
                    <Card>
                        <CardHeader><CardTitle>Atividades Recentes</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <ActivityItem text="Cargo 'Analista de Dados Jr' foi avaliado" time="2 horas atrás" status="success" />
                            <ActivityItem text="Nova tabela salarial criada para TI" time="1 dia atrás" status="success" />
                            <ActivityItem text="Avaliação de cargo 'Gerente de Vendas' pendente" time="2 dias atrás" status="warning" />
                            <ActivityItem text="0 funcionários admitidos recentemente" time="3 dias atrás" status="success" />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Progresso de Implementação</CardTitle>
                            <CardDescription>Status geral do sistema de C&S</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <ProgressItem label="Cargos Cadastrados" percentage={10} />
                            <ProgressItem label="Funcionários Cadastrados" percentage={1} />
                            <ProgressItem label="Avaliações Concluídas" percentage={60} />
                        </CardContent>
                    </Card>
                </div>

                <div>
                    <Card>
                        <CardHeader><CardTitle>Tarefas Pendentes</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <TaskItem text="Avaliar novos cargos da área de Marketing" priority="high" deadline="2 dias" />
                            <TaskItem text="Revisar tabela salarial – Área Comercial" priority="medium" deadline="1 semana" />
                            <TaskItem text="Atualizar descrições de cargo da TI" priority="low" deadline="2 semanas" />
                            <TaskItem text="Cadastrar novos funcionários contratados" priority="medium" deadline="3 dias" />
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Ações Rápidas */}
            <Card>
                <CardHeader><CardTitle>Ações Rápidas</CardTitle></CardHeader>
                <CardContent>
                    <div className="flex gap-4 flex-wrap">
                        <NovoCargoButton onCreated={() => { /* emit via componente */ }} />
                        <NovoFuncionarioButton onCreated={() => { /* emit via componente */ }} />
                        <AvaliarCargoButton />
                        <NovaTabelaSalarialButton onCreated={() => { /* emit via componente */ }} />
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

/* ===================== ESTRUTURA ===================== */
function EstruturaPage({ selectedTab, setSelectedTab }: { selectedTab: string; setSelectedTab: (tab: string) => void }) {
    const [empresas, setEmpresas] = useState<Empresa[]>([])
    const [estabs, setEstabs] = useState<any[]>([])
    const [centros, setCentros] = useState<any[]>([])
    const [sindicatos, setSindicatos] = useState<any[]>([])
    const [convencoes, setConvencoes] = useState<any[]>([])
    const [quadros, setQuadros] = useState<any[]>([])

    const refetch = ()=>{
        getJSON<Empresa[]>("/api/empresas").then(setEmpresas).catch(()=>{})
        getJSON<any[]>("/api/estabelecimentos").then(setEstabs).catch(()=>{})
        getJSON<any[]>("/api/centros").then(setCentros).catch(()=>{})
        getJSON<any[]>("/api/sindicatos").then(setSindicatos).catch(()=>{})
        getJSON<any[]>("/api/convencoes").then(setConvencoes).catch(()=>{})
        getJSON<any[]>("/api/quadros").then(setQuadros).catch(()=>{})
    }
    useEffect(refetch, [])
    useEffect(()=>{ const u = onDataChanged(refetch); return u }, [])

    return (
        <div className="space-y-6">
            <div><p className="text-gray-600">Sistema completo de estrutura organizacional (inclui job, careertype)</p></div>

            <div className="grid grid-cols-5 gap-6">
                <SummaryCard title="Empresas" value={String(empresas.length)} />
                <SummaryCard title="Estabelecimentos" value={String(estabs.length)} />
                <SummaryCard title="Centros Custo" value={String(centros.length)} />
                <SummaryCard title="Sindicatos" value={String(sindicatos.length)} />
                <SummaryCard title="Convenções" value={String(convencoes.length)} />
            </div>

            <div className="flex gap-2 border-b border-gray-200">
                {["empresas", "estabelecimentos", "centros", "sindicatos", "convencoes", "quadros"].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setSelectedTab(tab)}
                        className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                            selectedTab === tab ? "border-blue-600 text-blue-600" : "border-transparent text-gray-600 hover:text-gray-900"
                        }`}
                    >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                ))}
            </div>

            {selectedTab === "empresas" && (
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Empresas Cadastradas</CardTitle>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm">
                                    <Download className="w-4 h-4 mr-2" />
                                    Exportar CSV
                                </Button>
                                <Button onClick={()=>downloadCSV("estrutura_geral.csv", [...empresas])}>Relatório Geral</Button>
                                <NovaEmpresaButton onCreated={(e)=>setEmpresas(p=>[...p,e])} />
                            </div>
                        </div>
                        <div className="mt-4"><Input placeholder="Buscar por razão social, nome fantasia ou CNPJ..." /></div>
                    </CardHeader>
                    <CardContent>
                        {empresas.length === 0 ? (
                            <p className="text-sm text-gray-600">Nenhuma empresa cadastrada.</p>
                        ) : (
                            empresas.map(e => (
                                <CompanyRow key={e.id} code={e.code || "-"} name={e.name} fantasia={e.fantasia} cnpj={e.cnpj} status={e.status || "Ativa"} />
                            ))
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    )
}

/* ===================== CARGOS ===================== */
function CargosPage() {
    const [cargos, setCargos] = useState<Cargo[]>([])
    const [trilhas, setTrilhas] = useState<any[]>([])

    const refetch = ()=>{
        getJSON<Cargo[]>("/api/cargos").then(setCargos).catch(()=>{})
        getJSON<any[]>("/api/trilhas").then(setTrilhas).catch(()=>{})
    }
    useEffect(refetch, [])
    useEffect(()=>{ const u = onDataChanged(refetch); return u }, [])

    const niveis = new Set(cargos.map(c => String(c.nivel ?? ""))).size

    return (
        <div className="space-y-6">
            <div><p className="text-gray-600">Gerencie cargos, tipos, níveis e trilhas de carreira</p></div>

            <div className="grid grid-cols-5 gap-6">
                <SummaryCard title="Total de Cargos" value={String(cargos.length)} />
                <SummaryCard title="Trilhas Ativas" value={String(trilhas.length)} />
                <SummaryCard title="Níveis Totais" value={String(niveis)} />
                <SummaryCard title="Cargos Vinculados" value="0" />
                <SummaryCard title="Cobertura" value="0%" />
            </div>

            <div className="flex gap-4">
                <Input placeholder="Buscar Cargo" className="max-w-xs" />
                <select className="px-3 py-2 border border-gray-200 rounded-lg text-sm">
                    <option>Filtrar por Área (todas as áreas)</option>
                </select>
                <div className="ml-auto flex gap-2">
                    <NovoCargoButton onCreated={(c)=>setCargos(p=>[...p,c])} />
                    <NovaTrilhaButton onCreated={(t)=>setTrilhas(p=>[...p,t])} />
                </div>
            </div>

            <div className="space-y-4">
                {cargos.map(c => (
                    <PositionCard key={c.id} title={c.titulo} area={c.area} level={c.nivel} points={c.pontos} />
                ))}
            </div>
        </div>
    )
}

/* ===================== FUNCIONÁRIOS ===================== */
function FuncionariosPage() {
    const [funcionarios, setFuncionarios] = useState<Funcionario[]>([])

    const refetch = ()=>{ getJSON<Funcionario[]>("/api/funcionarios").then(setFuncionarios).catch(()=>{}) }
    useEffect(refetch, [])
    useEffect(()=>{ const u = onDataChanged(refetch); return u }, [])

    const total = funcionarios.length
    const ativos = funcionarios.filter(f => f.status === "ativo").length
    const ferias = funcionarios.filter(f => f.status === "ferias").length

    return (
        <div className="space-y-6">
            <div><p className="text-gray-600">Cadastre e gerencie os colaboradores da sua organização</p></div>

            <div className="grid grid-cols-6 gap-6">
                <SummaryCard title="Total" value={String(total)} />
                <SummaryCard title="Ativos" value={String(ativos)} />
                <SummaryCard title="Férias" value={String(ferias)} />
                <SummaryCard title="Com Gestor" value={String(funcionarios.filter(f=>!!f.gestor).length)} />
                <SummaryCard
                    title="Salário Médio"
                    value={ total
                        ? `R$ ${Math.round(funcionarios.reduce((s,f)=>s+(Number(f.salario)||0),0)/total).toLocaleString('pt-BR')}`
                        : "—"
                    }
                />
                <SummaryCard
                    title="Novos (3m)"
                    value={ String(funcionarios.filter(f => {
                        const d = f.admissao ? new Date(f.admissao) : null
                        return d ? (Date.now() - d.getTime())/(1000*60*60*24) <= 90 : false
                    }).length)}
                />
            </div>

            <div className="flex gap-4">
                <Input placeholder="Buscar por nome, email ou cargo" className="max-w-xs" />
                <select className="px-3 py-2 border border-gray-200 rounded-lg text-sm"><option>Área</option></select>
                <select className="px-3 py-2 border border-gray-200 rounded-lg text-sm"><option>Status</option></select>
                <div className="ml-auto"><NovoFuncionarioButton onCreated={(f)=>setFuncionarios(p=>[...p,f])} /></div>
            </div>

            <Card>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cargo</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Área</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Gestor</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Admissão</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Salário</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                            {funcionarios.map(f => (
                                <EmployeeRow
                                    key={f.id}
                                    id={f.id}
                                    name={f.nome}
                                    position={f.cargo}
                                    area={f.area}
                                    manager={f.gestor || '-'}
                                    admission={f.admissao || ''}
                                    salary={f.salario ? `R$ ${Number(f.salario).toLocaleString('pt-BR')}` : '-'}
                                    status={f.status || 'ativo'}
                                />
                            ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

/* ===================== AVALIAÇÕES ===================== */
function AvaliacaoPage() {
    const [cargos, setCargos] = useState<Cargo[]>([])
    const [avaliacoes, setAvaliacoes] = useState<any[]>([])
    const refetch = ()=>{
        getJSON<Cargo[]>("/api/cargos").then(setCargos).catch(()=>{})
        getJSON<any[]>("/api/avaliacoes").then(setAvaliacoes).catch(()=>{})
    }
    useEffect(refetch, [])
    useEffect(()=>{ const u = onDataChanged(refetch); return u }, [])

    const totalCargos = cargos.length
    const totalAval = avaliacoes.length
    const pendentes = Math.max(0, totalCargos - totalAval)
    const media = totalAval ? Math.round(avaliacoes.reduce((s,a)=>s+(a.pontuacao||0),0)/totalAval) : 0

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-4 gap-6">
                <SummaryCard title="Total de Cargos" value={String(cargos.length)} />
                <SummaryCard title="Cargos Avaliados" value={String(totalAval)} />
                <SummaryCard title="Pendentes" value={String(pendentes)} />
                <SummaryCard title="Pontuação Média" value={String(media)} />
            </div>

            <div className="flex gap-4">
                <Input placeholder="Buscar cargo" className="max-w-xs" />
                <select className="px-3 py-2 border border-gray-200 rounded-lg text-sm"><option>Área</option></select>
                <select className="px-3 py-2 border border-gray-200 rounded-lg text-sm"><option>Status</option></select>
                <div className="ml-auto"><AvaliarCargoButton /></div>
            </div>

            <Card>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cargo</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pontuação</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                            {avaliacoes.map(a => (
                                <tr key={a.id}>
                                    <td className="px-6 py-4 text-sm text-gray-900">{a.funcionario}</td>
                                    <td className="px-6 py-4 text-sm text-gray-900">{a.pontuacao}</td>
                                    <td className="px-6 py-4 text-sm text-gray-900">{a.status}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

/* ===================== ORGANOGRAMA / TABELAS / RELATÓRIOS ===================== */
function OrganogramaPage() {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-6 gap-6">
                <SummaryCard title="Total de Pessoas" value="4" />
                <SummaryCard title="Gestores" value="0" />
                <SummaryCard title="Áreas" value="3" />
                <SummaryCard title="Níveis" value="1" />
                <SummaryCard title="Média Salarial" value="R$ 6.875" />
                <SummaryCard title="Folha Total" value="R$ 28K" />
            </div>

            <div className="flex gap-4">
                <Input placeholder="Buscar funcionário, cargo ou área" className="max-w-xs" />
                <select className="px-3 py-2 border border-gray-200 rounded-lg text-sm"><option>Visualização</option></select>
                <div className="ml-auto flex gap-2">
                    <Button variant="outline">Configurar Hierarquia</Button>
                    <Button variant="outline"><Download className="w-4 h-4 mr-2" />Exportar</Button>
                </div>
            </div>

            <div className="space-y-4">
                <OrgChartNode name="CEO/Diretor" position="Direção Executiva" type="root" />
                <OrgChartNode name="Bruno Costa Lima" position="Gerente de Vendas" area="Comercial" type="with-superior" />
                <OrgChartNode name="Carla Oliveira" position="Designer UX/UI" area="Design" type="no-superior" />
                <OrgChartNode name="Carlos Lima" position="Gestor de Tecnologia" area="Tecnologia" subordinates={2} type="with-subordinates" />
            </div>
        </div>
    )
}

function TabelasPage() {
    return (
        <div className="space-y-6">
            <div className="space-y-4">
                <SalaryGradeCard grade="Grade A" level="Executivo" points="400+ pontos" type="Tipo 01" min="R$ 15.000" mid="R$ 20.000" max="R$ 25.000" positions={2} />
                <SalaryGradeCard grade="Grade B" level="Gerencial" points="350-399 pontos" type="Tipo 02" min="R$ 8.000" mid="R$ 12.000" max="R$ 16.000" positions={5} />
                <SalaryGradeCard grade="Grade C" level="Especialista" points="300-349 pontos" type="Tipo 04" min="R$ 5.500" mid="R$ 7.500" max="R$ 9.500" positions={12} />
            </div>

            <div className="grid grid-cols-3 gap-6">
                <Card><CardHeader><CardTitle className="text-sm font-medium text-gray-600">Folha de Pagamento Total</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold">R$ 485.2K</div><p className="text-sm text-green-600 mt-1">+12% vs mês anterior</p></CardContent></Card>
                <Card><CardHeader><CardTitle className="text-sm font-medium text-gray-600">Crescimento Médio</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold">+8.5%</div><p className="text-sm text-gray-600 mt-1">nos últimos 12 meses</p></CardContent></Card>
                <Card><CardHeader><CardTitle className="text-sm font-medium text-gray-600">Funcionários por Grade</CardTitle></CardHeader><CardContent className="space-y-2">
                    <div className="flex items-center gap-2"><div className="flex-1 bg-gray-200 rounded-full h-2"><div className="bg-blue-600 h-2 rounded-full" style={{ width: "10%" }} /></div><span className="text-xs text-gray-600">Grade A: 2</span></div>
                    <div className="flex items-center gap-2"><div className="flex-1 bg-gray-200 rounded-full h-2"><div className="bg-blue-600 h-2 rounded-full" style={{ width: "26%" }} /></div><span className="text-xs text-gray-600">Grade B: 5</span></div>
                    <div className="flex items-center gap-2"><div className="flex-1 bg-gray-200 rounded-full h-2"><div className="bg-blue-600 h-2 rounded-full" style={{ width: "63%" }} /></div><span className="text-xs text-gray-600">Grade C: 12</span></div>
                </CardContent></Card>
            </div>

            <div className="flex justify-end"><Button>+ Nova Tabela</Button></div>
        </div>
    )
}

function RelatoriosPage() {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-3 gap-6">
                <ReportCard title="Relatório de Cargos" />
                <ReportCard title="Relatório de Funcionários" />
                <ReportCard title="Relatório Salarial" />
                <ReportCard title="Estrutura Organizacional" />
                <ReportCard title="Avaliações de Cargos" />
                <ReportCard title="Tabelas Salariais" />
            </div>

            <Card>
                <CardHeader><CardTitle>Métricas do Sistema</CardTitle></CardHeader>
                <CardContent>
                    <div className="grid grid-cols-4 gap-6">
                        <div><div className="text-sm text-gray-600">Taxa de Completude</div><div className="text-2xl font-bold mt-1">94%</div></div>
                        <div><div className="text-sm text-gray-600">Crescimento Mensal</div><div className="text-2xl font-bold mt-1">+12%</div></div>
                        <div><div className="text-sm text-gray-600">Tempo Médio Avaliação</div><div className="text-2xl font-bold mt-1">3.2</div></div>
                        <div><div className="text-sm text-gray-600">Satisfação Funcionários</div><div className="text-2xl font-bold mt-1">87%</div></div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

/* ===================== REUSABLES ===================== */
function SummaryCard({ title, value, description }: { title: string; value: string; description?: string }) {
    return (
        <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold">{value}</div>{description && <p className="text-xs text-gray-500 mt-1">{description}</p>}</CardContent>
        </Card>
    )
}

function ActivityItem({ text, time, status }: { text: string; time: string; status: "success" | "warning" }) {
    return (
        <div className="flex items-start gap-3">
            <div className={`w-2 h-2 rounded-full mt-2 ${status === "success" ? "bg-green-500" : "bg-yellow-500"}`} />
            <div className="flex-1"><p className="text-sm text-gray-900">{text}</p><p className="text-xs text-gray-500 mt-1">{time}</p></div>
        </div>
    )
}

function ProgressItem({ label, percentage }: { label: string; percentage: number }) {
    return (
        <div>
            <div className="flex justify-between text-sm mb-2"><span className="text-gray-700">{label}</span><span className="font-medium">{percentage}%</span></div>
            <div className="w-full bg-gray-200 rounded-full h-2"><div className="bg-blue-600 h-2 rounded-full transition-all" style={{ width: `${percentage}%` }} /></div>
        </div>
    )
}

function TaskItem({ text, priority, deadline }: { text: string; priority: "high" | "medium" | "low"; deadline: string }) {
    const priorityColors = { high: "bg-red-100 text-red-700", medium: "bg-yellow-100 text-yellow-700", low: "bg-gray-100 text-gray-700" }
    return (
        <div className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg">
            <div className="flex-1"><p className="text-sm text-gray-900">{text}</p><p className="text-xs text-gray-500 mt-1">Prazo: {deadline}</p></div>
            <Badge className={priorityColors[priority]}>{priority === "high" ? "Alta" : priority === "medium" ? "Média" : "Baixa"}</Badge>
        </div>
    )
}

function CompanyRow({ code, name, fantasia, cnpj, status }: { code: string; name: string; fantasia: string; cnpj: string; status: string }) {
    return (
        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex-1">
                <div className="flex items-center gap-3"><span className="font-mono text-sm text-gray-500">{code}</span><span className="font-medium text-gray-900">{name}</span></div>
                <div className="flex items-center gap-4 mt-1 text-sm text-gray-600"><span>Fantasia: {fantasia}</span><span>CNPJ: {cnpj}</span></div>
            </div>
            <Badge variant="secondary" className="bg-green-100 text-green-700">{status}</Badge>
        </div>
    )
}

function PositionCard({ title, area, level, points }: { title: string; area: string; level: string; points: number }) {
    return (
        <Card>
            <CardContent className="p-4">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{title}</h3>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-600"><span>Área: {area}</span><span>Nível: {level}</span><span>Pontos: {points}</span></div>
                        <div className="mt-3 flex items-center gap-2 text-sm text-yellow-700 bg-yellow-50 px-3 py-2 rounded">
                            <span>⚠️</span><span>Sem trilha: Vincule a uma trilha de carreira</span>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

function EmployeeRow({ id, name, position, area, manager, admission, salary, status }: {
    id: number; name: string; position: string; area: string; manager: string; admission: string; salary: string; status: string
}) {
    const isAtivo = (status || "").toLowerCase() === "ativo"
    return (
        <tr>
            <td className="px-6 py-4 text-sm text-gray-900">{name}</td>
            <td className="px-6 py-4 text-sm text-gray-600">{position}</td>
            <td className="px-6 py-4 text-sm text-gray-600">{area}</td>
            <td className="px-6 py-4 text-sm text-gray-600">{manager}</td>
            <td className="px-6 py-4 text-sm text-gray-600">{admission}</td>
            <td className="px-6 py-4 text-sm text-gray-900 font-medium">{salary}</td>
            <td className="px-6 py-4">
                <Badge variant="secondary" className={isAtivo ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}>{status}</Badge>
            </td>
            <td className="px-6 py-4">
                <div className="flex gap-2">
                    <button className="text-gray-400 hover:text-gray-600" title="Ver"><Eye className="w-4 h-4" /></button>
                    <button className="text-gray-400 hover:text-gray-600" title="Editar"><Edit className="w-4 h-4" /></button>
                    <button className="text-gray-400 hover:text-red-600" title="Excluir" onClick={async()=>{ try { await delJSON(`/api/funcionarios/${id}`) } catch(e){} }}>
                        <Trash className="w-4 h-4" />
                    </button>
                </div>
            </td>
        </tr>
    )
}

function OrgChartNode({ name, position, area, subordinates, type }: {
    id?: number; name: string; position: string; area?: string; subordinates?: number; type: "root" | "with-superior" | "no-superior" | "with-subordinates"
}) {
    return (
        <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="font-semibold text-gray-900">{name}</h3>
                        <p className="text-sm text-gray-600">{position}</p>
                        {area && <p className="text-xs text-gray-500 mt-1">Área: {area}</p>}
                    </div>
                    <div className="text-right">
                        {type === "root" && <Badge variant="secondary">Sem superior</Badge>}
                        {type === "with-superior" && <Badge variant="secondary" className="bg-green-100 text-green-700">Com superior</Badge>}
                        {type === "no-superior" && <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">Sem superior</Badge>}
                        {type === "with-subordinates" && <Badge variant="secondary" className="bg-blue-100 text-blue-700">{subordinates} subordinados</Badge>}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

function SalaryGradeCard({ grade, level, points, type, min, mid, max, positions }: {
    grade: string; level: string; points: string; type: string; min: string; mid: string; max: string; positions: number
}) {
    return (
        <Card>
            <CardContent className="p-6">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <div className="flex items-center gap-3">
                            <h3 className="text-xl font-bold text-gray-900">{grade}</h3>
                            <Badge variant="secondary">{level}</Badge>
                            <span className="text-sm text-gray-600">{points}</span>
                            <span className="text-sm text-gray-500">{type}</span>
                        </div>
                        <div className="flex items-center gap-6 mt-4">
                            <div><div className="text-xs text-gray-500">Mínimo</div><div className="text-lg font-semibold text-gray-900">{min}</div></div>
                            <ChevronRight className="w-4 h-4 text-gray-400" />
                            <div><div className="text-xs text-gray-500">Médio</div><div className="text-lg font-semibold text-gray-900">{mid}</div></div>
                            <ChevronRight className="w-4 h-4 text-gray-400" />
                            <div><div className="text-xs text-gray-500">Máximo</div><div className="text-lg font-semibold text-gray-900">{max}</div></div>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-2xl font-bold text-blue-600">{positions}</div>
                        <div className="text-xs text-gray-500">cargos</div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

function ReportCard({ title }: { title: string }) {
    return (
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader><CardTitle className="text-lg">{title}</CardTitle></CardHeader>
            <CardContent><Button className="w-full">Gerar Relatório</Button></CardContent>
        </Card>
    )
}
