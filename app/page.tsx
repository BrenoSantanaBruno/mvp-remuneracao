"use client"

import type React from "react"
import { useState, useEffect } from "react"

import { getJSON, delJSON } from "@/lib/api"
import { Toaster } from "@/components/ui/toaster"
import { downloadCSV } from "@/lib/csv"
import { onDataChanged } from "@/lib/events"

import { NovaEmpresaButton } from "@/components/features/empresas/NovaEmpresaButton"
import { NovoGenericoButton } from "@/components/features/generics/NovoGenericoButton"
import NovoCargoButton from "@/components/features/cargos/NovoCargoButton"
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
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

import {
    Building2,
    Users,
    Briefcase,
    BarChart3,
    Settings2,
    Download,
    ChevronRight,
    Menu,
    Plus,
    Trash2,
    MoreHorizontal,
    FileText,
    Star,
    ArrowUpRight,
    Filter,
    Search,
    ChevronDown,
    CircleDot,
    Target,
    GitBranch,
    Network,
    Eye,
} from "lucide-react"

function formatCurrency(value: number): string {
    return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
}

function formatDate(dateString: string | Date): string {
    const d = typeof dateString === "string" ? new Date(dateString) : dateString
    if (Number.isNaN(d.getTime())) return "-"
    return d.toLocaleDateString("pt-BR")
}

// Tipos de menu da esquerda
type MenuItem =
    | "dashboard"
    | "empresas"
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
                <div className="flex items-center gap-2 px-6 py-4 border-b">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                        R$
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-semibold text-gray-900">MVP Remuneração</span>
                        <span className="text-xs text-gray-500">Gestão de cargos & salários</span>
                    </div>
                </div>

                <nav className="mt-4 space-y-1">
                    <SidebarItem
                        icon={BarChart3}
                        label="Visão geral"
                        active={activeMenu === "dashboard"}
                        onClick={() => setActiveMenu("dashboard")}
                    />
                    <SidebarItem
                        icon={Building2}
                        label="Empresas & estruturas"
                        active={activeMenu === "empresas"}
                        onClick={() => setActiveMenu("empresas")}
                    />
                    <SidebarItem
                        icon={Briefcase}
                        label="Cargos & trilhas"
                        active={activeMenu === "cargos"}
                        onClick={() => setActiveMenu("cargos")}
                    />
                    <SidebarItem
                        icon={Users}
                        label="Funcionários"
                        active={activeMenu === "funcionarios"}
                        onClick={() => setActiveMenu("funcionarios")}
                    />
                    <SidebarItem
                        icon={Target}
                        label="Avaliação de cargos"
                        active={activeMenu === "avaliacao"}
                        onClick={() => setActiveMenu("avaliacao")}
                    />
                    <SidebarItem
                        icon={Network}
                        label="Organograma"
                        active={activeMenu === "organograma"}
                        onClick={() => setActiveMenu("organograma")}
                    />
                    <SidebarItem
                        icon={FileText}
                        label="Tabelas salariais"
                        active={activeMenu === "tabelas"}
                        onClick={() => setActiveMenu("tabelas")}
                    />
                    <SidebarItem
                        icon={BarChart3}
                        label="Relatórios"
                        active={activeMenu === "relatorios"}
                        onClick={() => setActiveMenu("relatorios")}
                    />
                </nav>

                <div className="absolute bottom-0 inset-x-0 border-t px-4 py-3 bg-white">
                    <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                            <AvatarFallback>WS</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <p className="text-xs font-medium text-gray-900">Workspace de Treino Wesley</p>
                            <p className="text-[11px] text-gray-500 truncate">Aula 05 · MVP Remuneração</p>
                        </div>
                        <Button size="icon" variant="ghost" className="h-7 w-7">
                            <Settings2 className="h-3.5 w-3.5" />
                        </Button>
                    </div>
                </div>
            </aside>

            {/* Conteúdo principal */}
            <div className="flex-1 ml-60 flex flex-col min-h-screen">
                {/* Top bar */}
                <header className="h-16 border-b bg-white flex items-center justify-between px-6">
                    <div className="flex items-center gap-3">
                        <Button size="icon" variant="ghost" className="md:hidden">
                            <Menu className="h-5 w-5" />
                        </Button>
                        <div className="flex flex-col">
                            <h1 className="text-lg font-semibold text-gray-900">
                                Sistema de Remuneração & Estrutura Organizacional
                            </h1>
                            <p className="text-xs text-gray-500">
                                Aula 05 · Integração do front-end com API Go + fluxos de cadastro
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button variant="outline" size="sm" className="hidden md:inline-flex">
                            <Star className="h-3.5 w-3.5 mr-1" />
                            Versão MVP
                        </Button>
                        <Button variant="outline" size="sm">
                            <Download className="h-3.5 w-3.5 mr-1" />
                            Exportar dados
                        </Button>
                    </div>
                </header>

                {/* Subheader com tabs rápidas */}
                <div className="border-b bg-white px-6 py-3 flex items-center justify-between">
                    <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-[480px]">
                        <TabsList className="grid grid-cols-4 w-full">
                            <TabsTrigger value="empresas" className="text-xs">
                                Empresas
                            </TabsTrigger>
                            <TabsTrigger value="cargos" className="text-xs">
                                Cargos
                            </TabsTrigger>
                            <TabsTrigger value="funcionarios" className="text-xs">
                                Funcionários
                            </TabsTrigger>
                            <TabsTrigger value="tabelas" className="text-xs">
                                Tabelas
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>

                    <div className="flex items-center gap-2">
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="outline" size="sm">
                                        <CircleDot className="h-3 w-3 mr-1 text-emerald-500" />
                                        Status: Conectado à API
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p className="text-xs max-w-xs">
                                        A API em Go está rodando dentro do Docker (container <code>api</code>). Se der erro 500
                                        ou 404, verificar os logs.
                                    </p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>

                        <Sheet>
                            <SheetTrigger asChild>
                                <Button size="icon" variant="outline">
                                    <Eye className="h-4 w-4" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="right" className="w-[400px] sm:w-[480px]">
                                <SheetHeader>
                                    <SheetTitle>Resumo do que vamos implementar na Aula 05</SheetTitle>
                                </SheetHeader>
                                <ScrollArea className="mt-4 h-[80vh] pr-2">
                                    <div className="space-y-4 text-sm text-gray-700">
                                        <p>
                                            Nesta aula, o objetivo é<span className="font-semibold"> conectar o layout que já existe</span> com
                                            as chamadas reais para a API em Go e começar a desenhar a jornada de cadastros completa:
                                        </p>
                                        <ul className="list-disc pl-5 space-y-1">
                                            <li>Carregar lista de empresas, cargos e funcionários com <code>getJSON</code></li>
                                            <li>
                                                Usar os botões <span className="font-mono text-xs">NovaEmpresaButton</span>,{" "}
                                                <span className="font-mono text-xs">NovoCargoButton</span>,{" "}
                                                <span className="font-mono text-xs">NovaTrilhaButton</span> e{" "}
                                                <span className="font-mono text-xs">NovoFuncionarioButton</span> para criar
                                                registros via API
                                            </li>
                                            <li>Atualizar o estado da tela assim que novos dados forem criados (fluxo reativo)</li>
                                            <li>Discutir com o especialista de domínio (você 😉) quais campos ainda faltam</li>
                                            <li>
                                                Planejar, em conjunto, as próximas features (relatórios, histórico de salário,
                                                trilhas de carreira, etc.)
                                            </li>
                                        </ul>

                                        <Separator className="my-4" />

                                        <p className="font-semibold">Pontos para discutir com o aluno:</p>
                                        <ol className="list-decimal pl-5 space-y-1">
                                            <li>Quais campos são obrigatórios para um cargo ser avaliável?</li>
                                            <li>Que tipo de relatório a gestão costuma pedir no dia a dia?</li>
                                            <li>Como a empresa enxerga trilhas de carreira (júnior, pleno, sênior, coordenação)?</li>
                                            <li>Qual o fluxo ideal de aprovação de uma nova tabela salarial?</li>
                                        </ol>

                                        <p className="mt-2 text-xs text-gray-500">
                                            Durante a aula, vocês podem usar Figma, Excalidraw ou até o próprio Notion como
                                            quadro para desenhar o fluxo.
                                        </p>
                                    </div>
                                </ScrollArea>
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>

                {/* Conteúdo central com páginas diferentes por menu */}
                <main className="flex-1 p-6">
                    {activeMenu === "dashboard" && <DashboardView />}
                    {activeMenu === "empresas" && <EmpresasView />}
                    {activeMenu === "cargos" && <CargosView />}
                    {activeMenu === "funcionarios" && <FuncionariosView />}
                    {activeMenu === "avaliacao" && <AvaliacaoView />}
                    {activeMenu === "organograma" && <OrganogramaView />}
                    {activeMenu === "tabelas" && <TabelasView />}
                    {activeMenu === "relatorios" && <RelatoriosView />}
                </main>

                <Toaster />
            </div>
        </div>
    )
}

function SidebarItem({
                         icon: Icon,
                         label,
                         active,
                         onClick,
                     }: {
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
    label: string
    active?: boolean
    onClick?: () => void
}) {
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm ${
                active
                    ? "bg-blue-50 text-blue-700 border-l-2 border-blue-600 font-medium"
                    : "text-gray-600 hover:bg-gray-50"
            }`}
        >
            <Icon className="h-4 w-4" />
            <span>{label}</span>
        </button>
    )
}

/* DASHBOARD (visão geral) */

function DashboardView() {
    const [resumo, setResumo] = useState<{
        empresas: number
        cargos: number
        funcionarios: number
    } | null>(null)

    useEffect(() => {
        let ignore = false
        const fetchResumo = async () => {
            try {
                const [empresas, cargos, funcionarios] = await Promise.all([
                    getJSON<Empresa[]>("/api/empresas"),
                    getJSON<Cargo[]>("/api/cargos"),
                    getJSON<Funcionario[]>("/api/funcionarios"),
                ])
                if (ignore) return
                setResumo({
                    empresas: empresas.length,
                    cargos: cargos.length,
                    funcionarios: funcionarios.length,
                })
            } catch (e) {
                console.error("Erro ao carregar resumo:", e)
            }
        }

        fetchResumo()
        const unsub = onDataChanged(fetchResumo)
        return () => {
            ignore = true
            unsub()
        }
    }, [])

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Empresas</CardTitle>
                        <Building2 className="h-4 w-4 text-gray-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-semibold">
                            {resumo ? resumo.empresas : <span className="text-gray-400 text-base">Carregando...</span>}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                            Estruturas-mãe onde vamos pendurar cargos, áreas e funcionários.
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Cargos cadastrados</CardTitle>
                        <Briefcase className="h-4 w-4 text-gray-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-semibold">
                            {resumo ? resumo.cargos : <span className="text-gray-400 text-base">Carregando...</span>}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                            Incluindo níveis (júnior, pleno, sênior) e vínculos com centro de custo.
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Funcionários</CardTitle>
                        <Users className="h-4 w-4 text-gray-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-semibold">
                            {resumo ? resumo.funcionarios : <span className="text-gray-400 text-base">Carregando...</span>}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                            Base que alimenta cálculos de folha, aderência à tabela e futuros relatórios.
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Fluxo recomendado para usar o sistema</CardTitle>
                        <CardDescription>Este é o “caminho feliz” que você pode explicar para o aluno.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 text-sm text-gray-700">
                        <ol className="space-y-3 list-decimal pl-5">
                            <li>
                                <span className="font-semibold">Cadastrar empresa</span> (ou unidade de negócio) usando o botão{" "}
                                <span className="font-mono text-xs">NovaEmpresaButton</span>.
                            </li>
                            <li>
                                Criar <span className="font-semibold">centros de custo / áreas</span> usando o{" "}
                                <span className="font-mono text-xs">NovoGenericoButton</span> (centros de custo).
                            </li>
                            <li>
                                Cadastrar <span className="font-semibold">cargos</span> já vinculando à empresa e ao centro de custo
                                via <span className="font-mono text-xs">NovoCargoButton</span>.
                            </li>
                            <li>
                                Opcional: criar <span className="font-semibold">trilhas de carreira</span> com o{" "}
                                <span className="font-mono text-xs">NovaTrilhaButton</span> (junior → pleno → sênior → coordenação).
                            </li>
                            <li>
                                Cadastrar <span className="font-semibold">funcionários</span> e associar ao cargo + tabela salarial via{" "}
                                <span className="font-mono text-xs">NovoFuncionarioButton</span>.
                            </li>
                            <li>
                                Rodar a <span className="font-semibold">avaliação de cargos</span> para garantir coerência de pontos e
                                faixas salariais.
                            </li>
                            <li>
                                Por fim, usar <span className="font-semibold">relatórios</span> para simular cenários, promoções
                                e ajustes.
                            </li>
                        </ol>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Checklist da Aula 05</CardTitle>
                        <CardDescription>Você pode ir marcando com o aluno o que foi feito.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2 text-xs text-gray-700">
                        <p>✓ API Go rodando em Docker e acessível pelo front</p>
                        <p>✓ Layout principal pronto (sidebar, header, cards)</p>
                        <p>□ Conectar botões de cadastro à API (POST)</p>
                        <p>□ Recarregar listas após cadastro (estado reativo)</p>
                        <p>□ Tratar erros e exibir toasts amigáveis</p>
                        <p>□ Discutir próximas features com o aluno</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

/* EMPRESAS */

function EmpresasView() {
    const [empresas, setEmpresas] = useState<Empresa[]>([])
    const [loading, setLoading] = useState(false)
    const [search, setSearch] = useState("")

    useEffect(() => {
        let ignore = false
        const fetchEmpresas = async () => {
            try {
                setLoading(true)
                const data = await getJSON<Empresa[]>("/api/empresas")
                if (!ignore) setEmpresas(data)
            } catch (e) {
                console.error("Erro ao buscar empresas:", e)
            } finally {
                if (!ignore) setLoading(false)
            }
        }

        fetchEmpresas()
        const unsub = onDataChanged(fetchEmpresas)
        return () => {
            ignore = true
            unsub()
        }
    }, [])

    const filtered = empresas.filter((e) =>
        e.nome?.toLowerCase().includes(search.toLowerCase()) ||
        e.cnpj?.toLowerCase().includes(search.toLowerCase()),
    )

    const handleDelete = async (id?: number) => {
        if (!id) return
        if (!window.confirm("Tem certeza que deseja excluir esta empresa?")) return

        try {
            await delJSON(`/api/empresas/${id}`)
            setEmpresas((prev) => prev.filter((e) => e.id !== id))
        } catch (e) {
            console.error("Erro ao deletar empresa:", e)
        }
    }

    const handleExport = () => {
        downloadCSV(
            empresas.map((e) => ({
                ID: e.id,
                Nome: e.nome,
                CNPJ: e.cnpj,
                "Data criação": e.created_at,
            })),
            "empresas.csv",
        )
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                    <h2 className="text-lg font-semibold">Empresas & Unidades de Negócio</h2>
                    <p className="text-xs text-gray-500">
                        Aqui cadastramos as bases que vão agrupar centros de custo, cargos e funcionários.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <Search className="h-3.5 w-3.5 text-gray-400 absolute left-2 top-1/2 -translate-y-1/2" />
                        <Input
                            className="pl-7 h-8 w-[180px]"
                            placeholder="Buscar por nome ou CNPJ..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <Button variant="outline" size="sm" onClick={handleExport}>
                        <Download className="h-3.5 w-3.5 mr-1" />
                        CSV
                    </Button>
                    <NovaEmpresaButton onCreated={(e) => setEmpresas((prev) => [...prev, e])} />
                </div>
            </div>

            <Card>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">CNPJ</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Data de criação
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ações</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td className="px-6 py-4 text-sm text-gray-500" colSpan={4}>
                                        Carregando empresas...
                                    </td>
                                </tr>
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td className="px-6 py-4 text-sm text-gray-500" colSpan={4}>
                                        Nenhuma empresa cadastrada ainda.
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((e) => (
                                    <tr key={e.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-3 text-sm font-medium text-gray-900">{e.nome}</td>
                                        <td className="px-6 py-3 text-sm text-gray-700">{e.cnpj}</td>
                                        <td className="px-6 py-3 text-sm text-gray-700">
                                            {e.created_at ? formatDate(e.created_at) : "-"}
                                        </td>
                                        <td className="px-6 py-3 text-sm text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger>
                                                    <Button variant="ghost" size="icon" className="h-7 w-7">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Ações</DropdownMenuLabel>
                                                    <DropdownMenuItem onClick={() => alert("Em breve: editar empresa")}>
                                                        Editar
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        className="text-red-600"
                                                        onClick={() => handleDelete(e.id)}
                                                    >
                                                        <Trash2 className="h-3 w-3 mr-1" />
                                                        Excluir
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </td>
                                    </tr>
                                ))
                            )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

/* CARGOS */

function CargosView() {
    const [cargos, setCargos] = useState<Cargo[]>([])
    const [search, setSearch] = useState("")
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        let ignore = false
        const fetchCargos = async () => {
            try {
                setLoading(true)
                const data = await getJSON<Cargo[]>("/api/cargos")
                if (!ignore) setCargos(data)
            } catch (e) {
                console.error("Erro ao buscar cargos:", e)
            } finally {
                if (!ignore) setLoading(false)
            }
        }

        fetchCargos()
        const unsub = onDataChanged(fetchCargos)
        return () => {
            ignore = true
            unsub()
        }
    }, [])

    const filtered = cargos.filter((c) => {
        const texto = `${c.titulo ?? ""} ${c.area ?? ""} ${c.nivel ?? ""}`.toLowerCase()
        return texto.includes(search.toLowerCase())
    })

    const handleDelete = async (id?: number) => {
        if (!id) return
        if (!window.confirm("Tem certeza que deseja excluir este cargo?")) return

        try {
            await delJSON(`/api/cargos/${id}`)
            setCargos((prev) => prev.filter((c) => c.id !== id))
        } catch (e) {
            console.error("Erro ao deletar cargo:", e)
        }
    }

    const handleExport = () => {
        downloadCSV(
            cargos.map((c) => ({
                ID: c.id,
                Titulo: c.titulo,
                Area: c.area,
                Nivel: c.nivel,
                Pontos: c.pontos,
            })),
            "cargos.csv",
        )
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                    <h2 className="text-lg font-semibold">Cargos & trilhas de carreira</h2>
                    <p className="text-xs text-gray-500">
                        Aqui moram os cargos avaliáveis, trilhas e vínculos com áreas. Esta tela é o coração da remuneração.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <Search className="h-3.5 w-3.5 text-gray-400 absolute left-2 top-1/2 -translate-y-1/2" />
                        <Input
                            className="pl-7 h-8 w-[180px]"
                            placeholder="Buscar cargos..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <Button variant="outline" size="sm" onClick={handleExport}>
                        <Download className="h-3.5 w-3.5 mr-1" />
                        CSV
                    </Button>
                    <NovoCargoButton onCreated={(c) => setCargos((p) => [...p, c])} />
                    <NovaTrilhaButton />
                </div>
            </div>

            <Card>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cargo</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Área</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nível</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pontos</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ações</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td className="px-6 py-4 text-sm text-gray-500" colSpan={5}>
                                        Carregando cargos...
                                    </td>
                                </tr>
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td className="px-6 py-4 text-sm text-gray-500" colSpan={5}>
                                        Nenhum cargo cadastrado ainda.
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((c) => (
                                    <tr key={c.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-3 text-sm font-medium text-gray-900">{c.titulo}</td>
                                        <td className="px-6 py-3 text-sm text-gray-700">{c.area}</td>
                                        <td className="px-6 py-3 text-sm text-gray-700">{c.nivel}</td>
                                        <td className="px-6 py-3 text-sm text-gray-700">{c.pontos}</td>
                                        <td className="px-6 py-3 text-sm text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger>
                                                    <Button variant="ghost" size="icon" className="h-7 w-7">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Ações</DropdownMenuLabel>
                                                    <DropdownMenuItem onClick={() => alert("Em breve: editar cargo")}>
                                                        Editar
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => alert("Em breve: ver trilha de carreira")}>
                                                        Ver trilha de carreira
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        className="text-red-600"
                                                        onClick={() => handleDelete(c.id)}
                                                    >
                                                        <Trash2 className="h-3 w-3 mr-1" />
                                                        Excluir
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </td>
                                    </tr>
                                ))
                            )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

/* FUNCIONÁRIOS */

function FuncionariosView() {
    const [funcionarios, setFuncionarios] = useState<Funcionario[]>([])
    const [search, setSearch] = useState("")
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        let ignore = false
        const fetchFuncionarios = async () => {
            try {
                setLoading(true)
                const data = await getJSON<Funcionario[]>("/api/funcionarios")
                if (!ignore) setFuncionarios(data)
            } catch (e) {
                console.error("Erro ao buscar funcionários:", e)
            } finally {
                if (!ignore) setLoading(false)
            }
        }

        fetchFuncionarios()
        const unsub = onDataChanged(fetchFuncionarios)
        return () => {
            ignore = true
            unsub()
        }
    }, [])

    const filtered = funcionarios.filter((f) => {
        const texto = `${f.nome ?? ""} ${(f as any).cargo_nome ?? ""}`.toLowerCase()
        return texto.includes(search.toLowerCase())
    })

    const handleDelete = async (id?: number) => {
        if (!id) return
        if (!window.confirm("Tem certeza que deseja excluir este funcionário?")) return

        try {
            await delJSON(`/api/funcionarios/${id}`)
            setFuncionarios((prev) => prev.filter((f) => f.id !== id))
        } catch (e) {
            console.error("Erro ao deletar funcionário:", e)
        }
    }

    const handleExport = () => {
        downloadCSV(
            funcionarios.map((f) => ({
                ID: f.id,
                Nome: f.nome,
                Cargo: (f as any).cargo_nome,
                Admissao: f.admissao,
                Salario: f.salario,
                Status: f.status,
            })),
            "funcionarios.csv",
        )
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                    <h2 className="text-lg font-semibold">Funcionários</h2>
                    <p className="text-xs text-gray-500">
                        Cadastro de pessoas com vínculo a cargo, tabela salarial e status (ativo, desligado, etc.).
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <Search className="h-3.5 w-3.5 text-gray-400 absolute left-2 top-1/2 -translate-y-1/2" />
                        <Input
                            className="pl-7 h-8 w-[180px]"
                            placeholder="Buscar por nome ou cargo..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <Button variant="outline" size="sm" onClick={handleExport}>
                        <Download className="h-3.5 w-3.5 mr-1" />
                        CSV
                    </Button>
                    <NovoFuncionarioButton onCreated={(f: Funcionario) => setFuncionarios(p => [...p, f])} />
                </div>
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
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ações</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td className="px-6 py-4 text-sm text-gray-500" colSpan={8}>
                                        Carregando funcionários...
                                    </td>
                                </tr>
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td className="px-6 py-4 text-sm text-gray-500" colSpan={8}>
                                        Nenhum funcionário cadastrado ainda.
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((f) => (
                                    <tr key={f.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-3 text-sm font-medium text-gray-900">{f.nome}</td>
                                        <td className="px-6 py-3 text-sm text-gray-700">
                                            {(f as any).cargo_nome ?? <span className="text-gray-400">Sem cargo</span>}
                                        </td>
                                        <td className="px-6 py-3 text-sm text-gray-700">
                                            {(f as any).area ?? <span className="text-gray-400">-</span>}
                                        </td>
                                        <td className="px-6 py-3 text-sm text-gray-700">
                                            {(f as any).gestor ?? <span className="text-gray-400">-</span>}
                                        </td>
                                        <td className="px-6 py-3 text-sm text-gray-700">
                                            {f.admissao ? formatDate(f.admissao) : "-"}
                                        </td>
                                        <td className="px-6 py-3 text-sm text-gray-700">
                                            {f.salario ? formatCurrency(f.salario) : "-"}
                                        </td>
                                        <td className="px-6 py-3 text-sm text-gray-700">
                                            {f.status ? (
                                                <Badge
                                                    variant={f.status === "Ativo" ? "default" : "outline"}
                                                    className={
                                                        f.status === "Ativo"
                                                            ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                                                            : ""
                                                    }
                                                >
                                                    {f.status}
                                                </Badge>
                                            ) : (
                                                <span className="text-gray-400">-</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-3 text-sm text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger>
                                                    <Button variant="ghost" size="icon" className="h-7 w-7">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Ações</DropdownMenuLabel>
                                                    <DropdownMenuItem onClick={() => alert("Em breve: editar funcionário")}>
                                                        Editar
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        className="text-red-600"
                                                        onClick={() => handleDelete(f.id)}
                                                    >
                                                        <Trash2 className="h-3 w-3 mr-1" />
                                                        Excluir
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </td>
                                    </tr>
                                ))
                            )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

/* AVALIAÇÃO DE CARGOS */

function AvaliacaoView() {
    return (
        <div className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                    <h2 className="text-lg font-semibold">Avaliação de Cargos</h2>
                    <p className="text-xs text-gray-500">
                        Módulo para registrar pontos, critérios e garantir equidade interna entre cargos.
                    </p>
                </div>
                <AvaliarCargoButton />
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>O que vamos discutir nesta tela</CardTitle>
                    <CardDescription>
                        Use esta parte da aula para perguntar como a empresa faz a avaliação hoje e traduzir isso em
                        funcionalidades.
                    </CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-gray-700 space-y-3">
                    <p>
                        Aqui é um ótimo lugar para conversar com o aluno (especialista de domínio) sobre modelos de
                        avaliação por pontos, critérios (complexidade, impacto, responsabilidade, etc.) e como isso vira
                        cálculo.
                    </p>
                    <ul className="list-disc pl-5 space-y-1">
                        <li>Quais critérios são usados hoje para avaliar cargos?</li>
                        <li>Existe alguma ferramenta ou é tudo em planilha?</li>
                        <li>Como definem faixas salariais por pontuação?</li>
                        <li>Há governança/aprovação ou cada gestor faz sua própria avaliação?</li>
                    </ul>
                    <p className="text-xs text-gray-500">
                        A partir dessa conversa, vocês podem decidir juntos quais endpoints criar na API e quais campos
                        adicionar na interface.
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}

/* ORGANOGRAMA */

function OrganogramaView() {
    return (
        <div className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                    <h2 className="text-lg font-semibold">Organograma</h2>
                    <p className="text-xs text-gray-500">
                        Visão hierárquica da estrutura. Nesta etapa do MVP, podemos apenas simular a visão ou desenhar o
                        que será necessário.
                    </p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Discussão de requisitos para o organograma</CardTitle>
                    <CardDescription>
                        Use esta tela para mapear como o cliente entende a estrutura hierárquica.
                    </CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-gray-700 space-y-3">
                    <ul className="list-disc pl-5 space-y-1">
                        <li>É por cargo, por função ou por centro de custo?</li>
                        <li>Precisa de múltiplos vínculos (matricial) ou só hierarquia simples?</li>
                        <li>Há necessidade de exportar essa visualização para PDF ou PPT?</li>
                        <li>
                            O organograma precisa ser interativo (clicar em um cargo e ver detalhes) ou só uma imagem
                            estática já resolve?
                        </li>
                    </ul>
                    <p className="text-xs text-gray-500">
                        A partir daqui, vocês podem decidir se usam uma lib de organograma no React ou se geram via
                        backend.
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}

/* TABELAS SALARIAIS */

function TabelasView() {
    return (
        <div className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                    <h2 className="text-lg font-semibold">Tabelas Salariais</h2>
                    <p className="text-xs text-gray-500">
                        Módulo responsável por faixas salariais, pisos, tetos e enquadramento por cargo.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <NovaTabelaSalarialButton />
                    <Button variant="outline" size="sm">
                        <Download className="h-3.5 w-3.5 mr-1" />
                        Exportar tabelas
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Planejamento da modelagem</CardTitle>
                    <CardDescription>
                        Use esta tela para discutir com o aluno os campos e regras de negócio que a tabela precisa
                        contemplar.
                    </CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-gray-700 space-y-3">
                    <ul className="list-disc pl-5 space-y-1">
                        <li>Faixa mínima e máxima por cargo e nível</li>
                        <li>Curva de progressão (percentuais entre níveis)</li>
                        <li>Regras para promoções e mérito</li>
                        <li>Como será feita a vigência (versões de tabelas ao longo do tempo)</li>
                    </ul>
                    <p className="text-xs text-gray-500">
                        A partir disso, vocês podem desenhar o modelo em Go (struct, migrations) e os endpoints.
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}

/* RELATÓRIOS */

function RelatoriosView() {
    const relatorios = [
        "Mapa de cargos x faixas salariais",
        "Lista de funcionários fora da faixa",
        "Custo projetado de reajuste geral",
        "Simulação de promoções por trilha",
        "Impacto de mudanças na tabela salarial",
    ]

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-semibold">Relatórios</h2>
                    <p className="text-xs text-gray-500">
                        Aqui vocês vão decidir quais relatórios são realmente críticos para o dia a dia da gestão.
                    </p>
                </div>
                <Button variant="outline" size="sm">
                    <Filter className="h-3.5 w-3.5 mr-1" />
                    Filtros avançados
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Relatórios planejados para o MVP</CardTitle>
                    <CardDescription>
                        Cada cartão abaixo pode virar um endpoint na API e uma rota específica do front.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {relatorios.map((titulo) => (
                            <ReportCard key={titulo} title={titulo} />
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

function ReportCard({ title }: { title: string }) {
    return (
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
                <CardTitle className="text-lg flex items-center justify-between">
                    <span>{title}</span>
                    <ArrowUpRight className="h-4 w-4 text-gray-400" />
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-xs text-gray-500 mb-3">
                    Durante a aula, pergunte como esse relatório é feito hoje (planilha, sistema legado, etc.) e qual
                    o formato ideal de saída.
                </p>
                <Button className="w-full" variant="outline" size="sm">
                    <FileText className="h-3.5 w-3.5 mr-1" />
                    Abrir (em breve)
                </Button>
            </CardContent>
        </Card>
    )
}
