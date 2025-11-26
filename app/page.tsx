"use client"

import type React from "react"
import { useState, useEffect } from "react"

import { getJSON, postJSON, delJSON, putJSON } from "@/lib/api"
import { Toaster } from "@/components/ui/toaster"
import { downloadCSV } from "@/lib/csv"
import { onDataChanged } from "@/lib/events"
import { useToast } from "@/hooks/use-toast"

import { NovaEmpresaButton } from "@/components/features/empresas/NovaEmpresaButton"
import { NovoGenericoButton } from "@/components/features/generics/NovoGenericoButton"
import NovoCargoButton from "@/components/features/cargos/NovoCargoButton"
import NovaTrilhaButton from "@/components/features/cargos/NovaTrilhaButton"
import NovoFuncionarioButton from "@/components/features/funcionarios/NovoFuncionarioButton"
import AvaliarCargoButton from "@/components/features/cargos/AvaliarCargoButton"
import NovaTabelaSalarialButton from "@/components/features/tabelas/NovaTabelaSalarialButton"

import type { Empresa, Cargo, Funcionario, Sindicato, Convencao, Estabelecimento } from "@/types"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
    Menu,
    Trash2,
    MoreHorizontal,
    FileText,
    Star,
    ArrowUpRight,
    Filter,
    Search,
    CircleDot,
    Target,
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

// Centro de custo
type CentroCusto = {
    id?: number
    codigo?: string
    customCode?: string
    code?: string
    sigla?: string
    nome?: string
    fantasia?: string
    descricao?: string
    description?: string
    empresa_id?: number | null
}

// helpers para EMPRESA

function getEmpresaNome(e: any): string {
    return (
        e.nome ??
        e.name ??
        e.razao_social ??
        e.razaoSocial ??
        e.nome_fantasia ??
        e.nomeFantasia ??
        e.fantasia ??
        "-"
    )
}

function getEmpresaDoc(e: any): string {
    return (
        e.cnpj ??
        e.cnpj_cpf ??
        e.codigo ??
        e.code ??
        e.documento ??
        "-"
    )
}

function getEmpresaCreated(e: any): string | undefined {
    return e.created_at ?? e.createdAt ?? e.data_criacao ?? e.dataCriacao
}

function setEmpresaNome(obj: any, value: string) {
    obj.nome = value
    obj.name = value
    obj.razao_social = value
    obj.razaoSocial = value
    obj.nome_fantasia = value
    obj.nomeFantasia = value
    obj.fantasia = value
}

function setEmpresaDoc(obj: any, value: string) {
    obj.cnpj = value
    obj.cnpj_cpf = value
    obj.codigo = value
    obj.code = value
    obj.documento = value
}

// helpers para CENTRO DE CUSTO

function getCentroCodigo(c: CentroCusto): string {
    return (c.customCode ?? c.codigo ?? c.code ?? c.sigla ?? "").toString()
}

function getCentroNome(c: CentroCusto): string {
    return (c.nome ?? c.fantasia ?? c.descricao ?? c.description ?? "").toString()
}

function setCentroCodigo(c: any, value: string) {
    c.codigo = value
    c.code = value
    c.sigla = value
    c.customCode = value
}

function setCentroNome(c: any, value: string) {
    c.nome = value
    c.fantasia = value
    c.descricao = value
    c.description = value
}

// calcula próximo código CC-00X com base na lista atual
function getNextCentroCodigo(centros: CentroCusto[]): string {
    const prefix = "CC-"
    const nums = centros
        .map((c) => {
            const raw = getCentroCodigo(c).toUpperCase().trim()
            const match = raw.match(/^CC-(\d{3})$/)
            return match ? Number(match[1]) : null
        })
        .filter((n): n is number => n !== null)

    const nextNum = nums.length ? Math.max(...nums) + 1 : 1
    return `${prefix}${String(nextNum).padStart(3, "0")}`
}

export default function HRManagementSystem() {
    const [activeMenu, setActiveMenu] = useState<MenuItem>("dashboard")

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

                {/* Subheader - só status da API + resumo da aula */}
                <div className="border-b bg-white px-6 py-3 flex items-center justify-end">
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
                                            Nesta aula, o objetivo é
                                            <span className="font-semibold"> conectar o layout que já existe</span> com
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
                                Criar <span className="font-semibold">centros de custo / áreas</span> (como CC-001 Administrativo, CC-002 TI).
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

/* EMPRESAS + CENTROS DE CUSTO */

function EmpresasView() {
    const [empresas, setEmpresas] = useState<Empresa[]>([])
    const [centros, setCentros] = useState<CentroCusto[]>([])
    const [sindicatos, setSindicatos] = useState<Sindicato[]>([])
    const [ccts, setCcts] = useState<Convencao[]>([])
    const [estabelecimentos, setEstabelecimentos] = useState<Estabelecimento[]>([])
    const [estabelecimentoDefaultId, setEstabelecimentoDefaultId] = useState<number>(1)
    const [loadingEmpresas, setLoadingEmpresas] = useState(false)
    const [loadingCentros, setLoadingCentros] = useState(false)
    const [loadingSindicatos, setLoadingSindicatos] = useState(false)
    const [loadingCcts, setLoadingCcts] = useState(false)
    const [loadingEstabs, setLoadingEstabs] = useState(false)
    const [search, setSearch] = useState("")
    const { toast } = useToast()

    // edição de empresa
    const [editingEmpresaId, setEditingEmpresaId] = useState<number | null>(null)
    const [editingEmpresa, setEditingEmpresa] = useState<any | null>(null)
    const [modalEmpresaOpen, setModalEmpresaOpen] = useState(false)

    // criação/edição de centro
    const [creatingCentro, setCreatingCentro] = useState(false)
    const [editingCentroId, setEditingCentroId] = useState<number | null>(null)
    const [editingCentro, setEditingCentro] = useState<any | null>(null)
    const [newCentroCodigo, setNewCentroCodigo] = useState("")
    const [newCentroCustomCode, setNewCentroCustomCode] = useState("")
    const [newCentroNome, setNewCentroNome] = useState("")
    const [newCentroAtivo, setNewCentroAtivo] = useState(true)
    const [modalCentroOpen, setModalCentroOpen] = useState(false)
    const [selectedEmpresaId, setSelectedEmpresaId] = useState<number | null>(null)

    // sindicatos
    const [modalSindicatoOpen, setModalSindicatoOpen] = useState(false)
    const [editingSindicatoId, setEditingSindicatoId] = useState<number | null>(null)
    const [editingSindicato, setEditingSindicato] = useState<Partial<Sindicato> | null>(null)

    // CCTs
    const [modalCctOpen, setModalCctOpen] = useState(false)
    const [editingCctId, setEditingCctId] = useState<number | null>(null)
    const [editingCct, setEditingCct] = useState<Partial<Convencao> | null>(null)

    // Estabelecimentos
    const [modalEstabOpen, setModalEstabOpen] = useState(false)
    const [editingEstabId, setEditingEstabId] = useState<number | null>(null)
    const [editingEstab, setEditingEstab] = useState<Partial<Estabelecimento> | null>(null)

    useEffect(() => {
        let ignore = false

        const fetchAll = async () => {
            try {
                setLoadingEmpresas(true)
                setLoadingCentros(true)

                const [empresasData, centrosData] = await Promise.all([
                    getJSON<Empresa[]>("/api/empresas"),
                    getJSON<CentroCusto[]>("/api/centros"),
                ])
                const [sindData, cctData, estabData] = await Promise.all([
                    getJSON<Sindicato[]>("/api/sindicatos"),
                    getJSON<Convencao[]>("/api/convencoes"),
                    getJSON<Estabelecimento[]>("/api/estabelecimentos"),
                ])

                if (ignore) return
                setEmpresas(empresasData)
                setCentros(centrosData)
                setSindicatos(sindData)
                setCcts(cctData)
                setEstabelecimentos(estabData)
                if (empresasData?.length) {
                    setEstabelecimentoDefaultId(empresasData[0].id ?? 1)
                    setSelectedEmpresaId(empresasData[0].id ?? null)
                }
            } catch (e) {
                console.error("Erro ao buscar empresas/centros:", e)
            } finally {
                if (ignore) return
                setLoadingEmpresas(false)
                setLoadingCentros(false)
                setLoadingSindicatos(false)
                setLoadingCcts(false)
                setLoadingEstabs(false)
            }
        }

        fetchAll()
        const unsub = onDataChanged(fetchAll)
        return () => {
            ignore = true
            unsub()
        }
    }, [])

    const termo = search.trim().toLowerCase()

    const filteredEmpresas = termo
        ? empresas.filter((e: any) => {
            const nome = getEmpresaNome(e).toLowerCase()
            const doc = getEmpresaDoc(e).toLowerCase()
            return nome.includes(termo) || doc.includes(termo)
        })
        : empresas

    const handleDeleteEmpresa = async (id?: number) => {
        if (!id) return
        if (!window.confirm("Tem certeza que deseja excluir esta empresa?")) return

        try {
            await delJSON(`/api/empresas/${id}`)
            setEmpresas((prev) => prev.filter((e: any) => e.id !== id))
        } catch (e) {
            console.error("Erro ao deletar empresa:", e)
        }
    }

    const handleExportEmpresas = () => {
        downloadCSV(
            empresas.map((e: any) => ({
                ID: e.id,
                "Razão social / Nome":
                    getEmpresaNome(e),
                "CNPJ / Código": getEmpresaDoc(e),
                "Data criação": getEmpresaCreated(e) ?? "",
            })),
            "empresas.csv",
        )
    }

    const startEditEmpresa = (e: any) => {
        setEditingEmpresaId(e.id)
        setEditingEmpresa({ ...e })
        setModalEmpresaOpen(true)
    }

    const cancelEditEmpresa = () => {
        setEditingEmpresaId(null)
        setEditingEmpresa(null)
        setModalEmpresaOpen(false)
    }

    const saveEditEmpresa = async () => {
        if (!editingEmpresa || !editingEmpresaId) return
        try {
            const updated = await putJSON<any>(`/api/empresas/${editingEmpresaId}`, editingEmpresa)
            setEmpresas((prev) =>
                prev.map((e: any) => (e.id === editingEmpresaId ? updated : e)),
            )
            setEditingEmpresaId(null)
            setEditingEmpresa(null)
            setModalEmpresaOpen(false)
            toast({ title: "Empresa atualizada" })
        } catch (e) {
            console.error("Erro ao atualizar empresa:", e)
            toast({ variant: "destructive", title: "Erro ao atualizar empresa", description: String(e) })
        }
    }

    const handleCreateCentro = async () => {
        const codigo = newCentroCodigo.trim()
        const custom = newCentroCustomCode.trim() || codigo
        const nome = newCentroNome.trim()

        if (!custom || !nome) {
            toast({ variant: "destructive", title: "Preencha o código e o nome do centro de custo." })
            return
        }

        try {
            const payload: any = {}
            setCentroCodigo(payload, custom)
            setCentroNome(payload, nome)
            payload.customCode = custom
            payload.descricao = nome
            payload.estabelecimentoId = estabelecimentoDefaultId
            payload.ativo = newCentroAtivo

            const created = await postJSON<CentroCusto>("/api/centros", payload)
            setCentros((prev) => [...prev, created])
            setNewCentroCodigo("")
            setNewCentroCustomCode("")
            setNewCentroNome("")
            setNewCentroAtivo(true)
            setCreatingCentro(false)
            toast({ title: "Centro de custo criado" })
        } catch (e) {
            console.error("Erro ao criar centro de custo:", e)
            toast({ variant: "destructive", title: "Erro ao criar centro de custo", description: String(e) })
        }
    }

    const startEditCentro = (c: CentroCusto) => {
        setEditingCentroId(c.id ?? null)
        setEditingCentro({ ...c })
        setCreatingCentro(false)
        setModalCentroOpen(true)
    }

    const cancelEditCentro = () => {
        setEditingCentroId(null)
        setEditingCentro(null)
        setModalCentroOpen(false)
    }

    const saveEditCentro = async () => {
        if (!editingCentro || !editingCentroId) return
        try {
            const payload: any = { ...editingCentro }
            payload.customCode = getCentroCodigo(payload)
            const updated = await putJSON<CentroCusto>(`/api/centros/${editingCentroId}`, payload)
            setCentros((prev) =>
                prev.map((c) => (c.id === editingCentroId ? updated : c)),
            )
            setEditingCentroId(null)
            setEditingCentro(null)
            setModalCentroOpen(false)
            toast({ title: "Centro de custo atualizado" })
        } catch (e) {
            console.error("Erro ao atualizar centro de custo:", e)
            toast({ variant: "destructive", title: "Erro ao atualizar centro de custo", description: String(e) })
        }
    }

    const handleDeleteCentro = async (id?: number) => {
        if (!id) return
        if (!window.confirm("Tem certeza que deseja excluir este centro de custo?")) return

        try {
            await delJSON(`/api/centros/${id}`)
            setCentros((prev) => prev.filter((c) => c.id !== id))
            toast({ title: "Centro de custo removido" })
        } catch (e) {
            console.error("Erro ao deletar centro de custo:", e)
            toast({ variant: "destructive", title: "Erro ao deletar centro de custo", description: String(e) })
        }
    }

    // SINDICATOS
    const openNovoSindicato = () => {
        setEditingSindicatoId(null)
        setEditingSindicato({ nome: "", tipo: "patronal", ativo: true })
        setModalSindicatoOpen(true)
    }
    const startEditSindicato = (s: Sindicato) => {
        setEditingSindicatoId(s.id)
        setEditingSindicato({ ...s })
        setModalSindicatoOpen(true)
    }
    const saveSindicato = async () => {
        if (!editingSindicato) return
        const payload: any = { ...editingSindicato }
        try {
            let saved: Sindicato
            if (editingSindicatoId) {
                saved = await putJSON<Sindicato>(`/api/sindicatos/${editingSindicatoId}`, payload)
                setSindicatos((prev) => prev.map((s) => (s.id === editingSindicatoId ? saved : s)))
            } else {
                saved = await postJSON<Sindicato>("/api/sindicatos", payload)
                setSindicatos((prev) => [...prev, saved])
            }
            setModalSindicatoOpen(false)
            setEditingSindicato(null)
            setEditingSindicatoId(null)
            toast({ title: "Sindicato salvo" })
        } catch (e) {
            toast({ variant: "destructive", title: "Erro ao salvar sindicato", description: String(e) })
        }
    }
    const deleteSindicato = async (id?: number) => {
        if (!id) return
        if (!window.confirm("Excluir este sindicato?")) return
        try {
            await delJSON(`/api/sindicatos/${id}`)
            setSindicatos((prev) => prev.filter((s) => s.id !== id))
            toast({ title: "Sindicato removido" })
        } catch (e) {
            toast({ variant: "destructive", title: "Erro ao excluir sindicato", description: String(e) })
        }
    }

    // CCTs
    const openNovaCct = () => {
        setEditingCctId(null)
        setEditingCct({ observacoes: "", sindicatoPatronalId: undefined, sindicatoTrabalhadoresId: undefined })
        setModalCctOpen(true)
    }
    const startEditCct = (cct: Convencao) => {
        setEditingCctId(cct.id)
        setEditingCct({ ...cct })
        setModalCctOpen(true)
    }
    const saveCct = async () => {
        if (!editingCct) return
        const payload: any = { ...editingCct }
        try {
            let saved: Convencao
            if (editingCctId) {
                saved = await putJSON<Convencao>(`/api/convencoes/${editingCctId}`, payload)
                setCcts((prev) => prev.map((c) => (c.id === editingCctId ? saved : c)))
            } else {
                saved = await postJSON<Convencao>("/api/convencoes", payload)
                setCcts((prev) => [...prev, saved])
            }
            setModalCctOpen(false)
            setEditingCct(null)
            setEditingCctId(null)
            toast({ title: "CCT salva" })
        } catch (e) {
            toast({ variant: "destructive", title: "Erro ao salvar CCT", description: String(e) })
        }
    }
    const deleteCct = async (id?: number) => {
        if (!id) return
        if (!window.confirm("Excluir esta CCT?")) return
        try {
            await delJSON(`/api/convencoes/${id}`)
            setCcts((prev) => prev.filter((c) => c.id !== id))
            toast({ title: "CCT removida" })
        } catch (e) {
            toast({ variant: "destructive", title: "Erro ao excluir CCT", description: String(e) })
        }
    }

    // Estabelecimentos
    const openNovoEstab = () => {
        setEditingEstabId(null)
        setEditingEstab({
            empresaId: selectedEmpresaId ?? empresas[0]?.id,
            tipo: "filial",
            ativo: true,
        } as any)
        setModalEstabOpen(true)
    }
    const startEditEstab = (est: Estabelecimento) => {
        setEditingEstabId(est.id)
        setEditingEstab({ ...est })
        setModalEstabOpen(true)
    }
    const saveEstab = async () => {
        if (!editingEstab || !editingEstab.empresaId) {
            toast({ variant: "destructive", title: "Empresa do estabelecimento é obrigatória" })
            return
        }
        const payload: any = { ...editingEstab }
        payload.empresaId = Number(payload.empresaId)
        try {
            let saved: Estabelecimento
            if (editingEstabId) {
                saved = await putJSON<Estabelecimento>(`/api/estabelecimentos/${editingEstabId}`, payload)
                setEstabelecimentos((prev) => prev.map((e) => (e.id === editingEstabId ? saved : e)))
            } else {
                saved = await postJSON<Estabelecimento>("/api/estabelecimentos", payload)
                setEstabelecimentos((prev) => [...prev, saved])
            }
            setModalEstabOpen(false)
            setEditingEstab(null)
            setEditingEstabId(null)
            toast({ title: "Estabelecimento salvo" })
        } catch (e) {
            toast({ variant: "destructive", title: "Erro ao salvar estabelecimento", description: String(e) })
        }
    }
    const deleteEstab = async (id?: number) => {
        if (!id) return
        if (!window.confirm("Excluir este estabelecimento?")) return
        try {
            await delJSON(`/api/estabelecimentos/${id}`)
            setEstabelecimentos((prev) => prev.filter((e) => e.id !== id))
            toast({ title: "Estabelecimento removido" })
        } catch (e) {
            toast({ variant: "destructive", title: "Erro ao excluir estabelecimento", description: String(e) })
        }
    }

    return (
        <div className="space-y-6">
            {/* Empresas */}
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
                            placeholder="Buscar por nome / CNPJ / código..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <Button variant="outline" size="sm" onClick={handleExportEmpresas}>
                        <Download className="h-3.5 w-3.5 mr-1" />
                        CSV
                    </Button>
                    <NovaEmpresaButton onCreated={(e: any) => setEmpresas((prev) => [...prev, e])} />
                </div>
            </div>

            <Card>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Nome
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    CNPJ / Código
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Data de criação
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                    Ações
                                </th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                            {loadingEmpresas ? (
                                <tr>
                                    <td className="px-6 py-4 text-sm text-gray-500" colSpan={4}>
                                        Carregando empresas...
                                    </td>
                                </tr>
                            ) : filteredEmpresas.length === 0 ? (
                                <tr>
                                    <td className="px-6 py-4 text-sm text-gray-500" colSpan={4}>
                                        Nenhuma empresa cadastrada ainda.
                                    </td>
                                </tr>
                            ) : (
                                filteredEmpresas.map((e: any) => {
                                    const nome = getEmpresaNome(e)
                                    const doc = getEmpresaDoc(e)
                                    const created = getEmpresaCreated(e)

                                    return (
                                        <tr key={e.id ?? `${nome}-${doc}`}>
                                            <td className="px-6 py-3 text-sm font-medium text-gray-900">
                                                {nome}
                                            </td>
                                            <td className="px-6 py-3 text-sm text-gray-700">
                                                {doc}
                                            </td>
                                            <td className="px-6 py-3 text-sm text-gray-700">
                                                {created ? formatDate(created) : "-"}
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
                                                        <DropdownMenuItem onClick={() => startEditEmpresa(e)}>
                                                            Editar
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            className="text-red-600"
                                                            onClick={() => handleDeleteEmpresa(e.id)}
                                                        >
                                                            <Trash2 className="h-3 w-3 mr-1" />
                                                            Excluir
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </td>
                                        </tr>
                                    )
                                })
                            )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* Sindicatos */}
            <Card>
                <CardHeader className="px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-base">Sindicatos</CardTitle>
                            <CardDescription>Patronal e dos Trabalhadores para compor CCTs.</CardDescription>
                        </div>
                        <Button size="sm" onClick={openNovoSindicato}>+ Novo sindicato</Button>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">CNPJ</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cidade/UF</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ações</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                            {loadingSindicatos ? (
                                <tr><td className="px-6 py-3 text-sm text-gray-500" colSpan={5}>Carregando sindicatos...</td></tr>
                            ) : sindicatos.length === 0 ? (
                                <tr><td className="px-6 py-3 text-sm text-gray-500" colSpan={5}>Nenhum sindicato cadastrado.</td></tr>
                            ) : sindicatos.map((s) => (
                                <tr key={s.id}>
                                    <td className="px-6 py-3 text-sm text-gray-900">{s.nome}</td>
                                    <td className="px-6 py-3 text-sm text-gray-700 capitalize">{s.tipo}</td>
                                    <td className="px-6 py-3 text-sm text-gray-700">{s.cnpj ?? "-"}</td>
                                    <td className="px-6 py-3 text-sm text-gray-700">{s.cidade ?? "-"} {s.uf ?? ""}</td>
                                    <td className="px-6 py-3 text-sm text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger>
                                                <Button variant="ghost" size="icon" className="h-7 w-7"><MoreHorizontal className="h-4 w-4" /></Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={()=>startEditSindicato(s)}>Editar</DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem className="text-red-600" onClick={()=>deleteSindicato(s.id)}>
                                                    <Trash2 className="h-3 w-3 mr-1" />Excluir
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* CCTs */}
            <Card>
                <CardHeader className="px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-base">Convenções Coletivas (CCTs)</CardTitle>
                            <CardDescription>Vínculo entre sindicatos e regras por CNAE/região.</CardDescription>
                        </div>
                        <Button size="sm" onClick={openNovaCct}>+ Nova CCT</Button>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Descrição</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sind. Patronal</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sind. Trabalhadores</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vigência</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ações</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                            {loadingCcts ? (
                                <tr><td className="px-6 py-3 text-sm text-gray-500" colSpan={5}>Carregando CCTs...</td></tr>
                            ) : ccts.length === 0 ? (
                                <tr><td className="px-6 py-3 text-sm text-gray-500" colSpan={5}>Nenhuma CCT cadastrada.</td></tr>
                            ) : ccts.map((c) => {
                                const sindP = sindicatos.find((s)=>s.id===c.sindicatoPatronalId)
                                const sindT = sindicatos.find((s)=>s.id===c.sindicatoTrabalhadoresId)
                                return (
                                    <tr key={c.id}>
                                        <td className="px-6 py-3 text-sm text-gray-900">{c.observacoes || c.cnae || "-"}</td>
                                        <td className="px-6 py-3 text-sm text-gray-700">{sindP?.nome ?? "-"}</td>
                                        <td className="px-6 py-3 text-sm text-gray-700">{sindT?.nome ?? "-"}</td>
                                        <td className="px-6 py-3 text-sm text-gray-700">
                                            {c.vigenciaInicio ? formatDate(c.vigenciaInicio) : "-"}{" "}
                                            {c.vigenciaFim ? `até ${formatDate(c.vigenciaFim)}` : ""}
                                        </td>
                                        <td className="px-6 py-3 text-sm text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger><Button variant="ghost" size="icon" className="h-7 w-7"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={()=>startEditCct(c)}>Editar</DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem className="text-red-600" onClick={()=>deleteCct(c.id)}>
                                                        <Trash2 className="h-3 w-3 mr-1" />Excluir
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </td>
                                    </tr>
                                )
                            })}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* Estabelecimentos */}
            <Card>
                <CardHeader className="px-6 py-4">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                        <div>
                            <CardTitle className="text-base">Estabelecimentos</CardTitle>
                            <CardDescription>Filiais/matrizes vinculadas à empresa.</CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                            <select
                                className="border rounded px-2 py-1 text-sm"
                                value={selectedEmpresaId ?? ""}
                                onChange={(e)=>setSelectedEmpresaId(Number(e.target.value))}
                            >
                                {empresas.map((em)=>(
                                    <option key={em.id} value={em.id}>{getEmpresaNome(em)}</option>
                                ))}
                            </select>
                            <Button size="sm" onClick={openNovoEstab}>+ Novo estabelecimento</Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">CNPJ</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Código</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">CNAE</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sind. Patronal</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sind. Trab.</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ações</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                            {loadingEstabs ? (
                                <tr><td className="px-6 py-3 text-sm text-gray-500" colSpan={8}>Carregando estabelecimentos...</td></tr>
                            ) : estabelecimentos.filter((e)=>!selectedEmpresaId || e.empresaId===selectedEmpresaId).length === 0 ? (
                                <tr><td className="px-6 py-3 text-sm text-gray-500" colSpan={8}>Nenhum estabelecimento para esta empresa.</td></tr>
                            ) : estabelecimentos.filter((e)=>!selectedEmpresaId || e.empresaId===selectedEmpresaId).map((est)=> {
                                const sindP = sindicatos.find((s)=>s.id===est.sindicatoPatronalId)
                                const sindT = sindicatos.find((s)=>s.id===est.sindicatoTrabalhadoresId)
                                return (
                                    <tr key={est.id}>
                                        <td className="px-6 py-3 text-sm text-gray-900">{est.cnpj}</td>
                                        <td className="px-6 py-3 text-sm text-gray-700">{est.codigo ?? "-"}</td>
                                        <td className="px-6 py-3 text-sm text-gray-700 capitalize">{est.tipo}</td>
                                        <td className="px-6 py-3 text-sm text-gray-700">
                                            <Badge variant={est.ativo === false ? "secondary" : "outline"}>
                                                {est.ativo === false ? "Inativo" : "Ativo"}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-3 text-sm text-gray-700">{est.cnae ?? "-"}</td>
                                        <td className="px-6 py-3 text-sm text-gray-700">{sindP?.nome ?? "-"}</td>
                                        <td className="px-6 py-3 text-sm text-gray-700">{sindT?.nome ?? "-"}</td>
                                        <td className="px-6 py-3 text-sm text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger><Button variant="ghost" size="icon" className="h-7 w-7"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={()=>startEditEstab(est)}>Editar</DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem className="text-red-600" onClick={()=>deleteEstab(est.id)}>
                                                        <Trash2 className="h-3 w-3 mr-1" />Excluir
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </td>
                                    </tr>
                                )
                            })}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
            {/* Centros de custo */}
            <Card>
                <CardHeader className="px-6 py-4">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                        <div>
                            <CardTitle className="text-base">Centros de custo</CardTitle>
                            <CardDescription>
                                Estruturas como CC-001 Administrativo, CC-002 TI. São usadas depois nos cadastros de cargos.
                            </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                            onClick={() => {
                                const next = getNextCentroCodigo(centros)
                                setNewCentroCodigo(next)
                                setNewCentroCustomCode(next)
                                setNewCentroNome("")
                                setNewCentroAtivo(true)
                                setCreatingCentro(true)
                                setEditingCentroId(null)
                                setEditingCentro(null)
                            }}
                            >
                                + Novo centro de custo
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Código
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Nome
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                    Ações
                                </th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                            {creatingCentro && (
                                <tr className="bg-amber-50/40">
                                    <td className="px-6 py-3 text-sm">
                                        <Input
                                            className="h-8 bg-gray-50"
                                            value={newCentroCustomCode || newCentroCodigo}
                                            onChange={(e) => setNewCentroCustomCode(e.target.value)}
                                            maxLength={32}
                                            autoFocus
                                        />
                                    </td>
                                    <td className="px-6 py-3 text-sm">
                                        <Input
                                            className="h-8"
                                            placeholder="Ex: Administrativo"
                                            value={newCentroNome}
                                            onChange={(e) => setNewCentroNome(e.target.value)}
                                        />
                                    </td>
                                    <td className="px-6 py-3 text-sm">
                                        <div className="flex items-center gap-2">
                                            <Button
                                                size="sm"
                                                variant={newCentroAtivo ? "secondary" : "outline"}
                                                onClick={() => setNewCentroAtivo(true)}
                                            >
                                                Ativo
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant={!newCentroAtivo ? "secondary" : "outline"}
                                                onClick={() => setNewCentroAtivo(false)}
                                            >
                                                Inativo
                                            </Button>
                                        </div>
                                    </td>
                                    <td className="px-6 py-3 text-sm text-right space-x-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                setCreatingCentro(false)
                                                setNewCentroCodigo("")
                                                setNewCentroNome("")
                                                setNewCentroAtivo(true)
                                            }}
                                        >
                                            Cancelar
                                        </Button>
                                        <Button size="sm" onClick={handleCreateCentro}>
                                            Salvar
                                        </Button>
                                    </td>
                                </tr>
                            )}

                            {loadingCentros ? (
                                <tr>
                                    <td className="px-6 py-4 text-sm text-gray-500" colSpan={4}>
                                        Carregando centros de custo...
                                    </td>
                                </tr>
                            ) : centros.length === 0 && !creatingCentro ? (
                                <tr>
                                    <td className="px-6 py-4 text-sm text-gray-500" colSpan={4}>
                                        Nenhum centro de custo cadastrado ainda.
                                    </td>
                                </tr>
                            ) : (
                                centros.map((c) => {
                                    const isEditing = editingCentroId === c.id
                                    const row = isEditing && editingCentro ? editingCentro : c
                                    const codigo = getCentroCodigo(row)
                                    const nome = getCentroNome(row)
                                    const status = row?.ativo === false ? "Inativo" : "Ativo"

                                    return (
                                        <tr key={c.id ?? codigo}>
                                            <td className="px-6 py-3 text-sm font-medium text-gray-900">
                                                {codigo}
                                            </td>
                                            <td className="px-6 py-3 text-sm text-gray-700">
                                                {nome}
                                            </td>
                                            <td className="px-6 py-3 text-sm text-gray-700">
                                                <Badge variant={row?.ativo === false ? "secondary" : "outline"}>
                                                    {status}
                                                </Badge>
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
                                    <DropdownMenuItem onClick={() => startEditCentro(c)}>
                                        Editar
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        className="text-red-600"
                                        onClick={() => handleDeleteCentro(c.id)}
                                    >
                                        <Trash2 className="h-3 w-3 mr-1" />
                                                            Excluir
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </td>
                                        </tr>
                                    )
                                })
                            )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            <Dialog
                open={modalEmpresaOpen}
                onOpenChange={(open) => {
                    setModalEmpresaOpen(open)
                    if (!open) cancelEditEmpresa()
                }}
            >
                <DialogContent className="sm:max-w-[520px]">
                    <DialogHeader>
                        <DialogTitle>Editar empresa</DialogTitle>
                    </DialogHeader>
                    {editingEmpresa && (
                        <div className="space-y-3">
                            <div>
                                <Label>Razão Social / Nome</Label>
                                <Input
                                    value={getEmpresaNome(editingEmpresa)}
                                    onChange={(e) => {
                                        const clone = { ...editingEmpresa }
                                        setEmpresaNome(clone, e.target.value)
                                        setEditingEmpresa(clone)
                                    }}
                                    autoFocus
                                />
                            </div>
                            <div>
                                <Label>CNPJ / Código interno</Label>
                                <Input
                                    value={getEmpresaDoc(editingEmpresa)}
                                    onChange={(e) => {
                                        const clone = { ...editingEmpresa }
                                        setEmpresaDoc(clone, e.target.value)
                                        setEditingEmpresa(clone)
                                    }}
                                />
                            </div>
                            <div>
                                <Label>Nome Fantasia</Label>
                                <Input
                                    value={editingEmpresa?.fantasia ?? editingEmpresa?.nomeFantasia ?? ""}
                                    onChange={(e) => {
                                        const clone = { ...editingEmpresa }
                                        clone.fantasia = e.target.value
                                        clone.nomeFantasia = e.target.value
                                        setEditingEmpresa(clone)
                                    }}
                                />
                            </div>
                        </div>
                    )}
                    <DialogFooter className="pt-4">
                        <Button variant="outline" onClick={cancelEditEmpresa}>
                            Cancelar
                        </Button>
                        <Button onClick={saveEditEmpresa} disabled={!editingEmpresa}>
                            Salvar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog
                open={modalCentroOpen}
                onOpenChange={(open) => {
                    setModalCentroOpen(open)
                    if (!open) cancelEditCentro()
                }}
            >
                <DialogContent className="sm:max-w-[520px]">
                    <DialogHeader>
                        <DialogTitle>Editar centro de custo</DialogTitle>
                    </DialogHeader>
                    {editingCentro && (
                        <div className="space-y-3">
                            <div>
                                <Label>Código</Label>
                                <Input
                                    value={getCentroCodigo(editingCentro)}
                                    onChange={(e) => {
                                        const clone = { ...editingCentro }
                                        setCentroCodigo(clone, e.target.value)
                                        setEditingCentro(clone)
                                    }}
                                    autoFocus
                                    maxLength={32}
                                />
                            </div>
                            <div>
                                <Label>Nome / Descrição</Label>
                                <Input
                                    value={getCentroNome(editingCentro)}
                                    onChange={(e) => {
                                        const clone = { ...editingCentro }
                                        setCentroNome(clone, e.target.value)
                                        clone.descricao = e.target.value
                                        setEditingCentro(clone)
                                    }}
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <Label>Status</Label>
                                <Button
                                    variant={editingCentro?.ativo === false ? "outline" : "secondary"}
                                    size="sm"
                                    onClick={() => {
                                        const clone = { ...editingCentro }
                                        clone.ativo = !(editingCentro?.ativo === false)
                                        setEditingCentro(clone)
                                    }}
                                >
                                    {editingCentro?.ativo === false ? "Inativo" : "Ativo"}
                                </Button>
                            </div>
                        </div>
                    )}
                    <DialogFooter className="pt-4">
                        <Button variant="outline" onClick={cancelEditCentro}>
                            Cancelar
                        </Button>
                        <Button onClick={saveEditCentro} disabled={!editingCentro}>
                            Salvar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog
                open={modalSindicatoOpen}
                onOpenChange={(open) => {
                    setModalSindicatoOpen(open)
                    if (!open) {
                        setEditingSindicatoId(null)
                        setEditingSindicato(null)
                    }
                }}
            >
                <DialogContent className="sm:max-w-[520px]">
                    <DialogHeader><DialogTitle>{editingSindicatoId ? "Editar sindicato" : "Novo sindicato"}</DialogTitle></DialogHeader>
                    <div className="space-y-3">
                        <div>
                            <Label>Nome</Label>
                            <Input
                                value={editingSindicato?.nome ?? ""}
                                onChange={(e)=>setEditingSindicato((prev)=> prev ? {...prev, nome:e.target.value} : {nome:e.target.value})}
                                autoFocus
                            />
                        </div>
                        <div>
                            <Label>Tipo</Label>
                            <select
                                className="border rounded px-2 py-1 w-full text-sm"
                                value={editingSindicato?.tipo ?? "patronal"}
                                onChange={(e)=>setEditingSindicato((prev)=> prev ? {...prev, tipo:e.target.value as any} : {tipo:e.target.value as any})}
                            >
                                <option value="patronal">Patronal</option>
                                <option value="trabalhadores">Trabalhadores</option>
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <Label>CNPJ</Label>
                                <Input value={editingSindicato?.cnpj ?? ""} onChange={(e)=>setEditingSindicato((prev)=> prev ? {...prev, cnpj:e.target.value} : {cnpj:e.target.value})} />
                            </div>
                            <div>
                                <Label>Vínculo patronal (p/ sindicato trabalhadores)</Label>
                                <select
                                    className="border rounded px-2 py-1 w-full text-sm"
                                    value={editingSindicato?.sindicatoPatronalId ?? ""}
                                    onChange={(e)=>setEditingSindicato((prev)=> prev ? {...prev, sindicatoPatronalId: e.target.value ? Number(e.target.value) : undefined} : {sindicatoPatronalId: Number(e.target.value)})}
                                >
                                    <option value="">Nenhum</option>
                                    {sindicatos.filter(s=>s.tipo==="patronal").map(s=>(
                                        <option key={s.id} value={s.id}>{s.nome}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div><Label>Cidade</Label><Input value={editingSindicato?.cidade ?? ""} onChange={(e)=>setEditingSindicato((p)=> p ? {...p, cidade:e.target.value} : {cidade:e.target.value})} /></div>
                            <div><Label>UF</Label><Input value={editingSindicato?.uf ?? ""} onChange={(e)=>setEditingSindicato((p)=> p ? {...p, uf:e.target.value} : {uf:e.target.value})} /></div>
                        </div>
                    </div>
                    <DialogFooter className="pt-4">
                        <Button variant="outline" onClick={()=>{setModalSindicatoOpen(false); setEditingSindicato(null); setEditingSindicatoId(null)}}>
                            Cancelar
                        </Button>
                        <Button onClick={saveSindicato} disabled={!editingSindicato?.nome}>
                            Salvar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog
                open={modalCctOpen}
                onOpenChange={(open) => {
                    setModalCctOpen(open)
                    if (!open) {
                        setEditingCct(null); setEditingCctId(null)
                    }
                }}
            >
                <DialogContent className="sm:max-w-[540px]">
                    <DialogHeader><DialogTitle>{editingCctId ? "Editar CCT" : "Nova CCT"}</DialogTitle></DialogHeader>
                    <div className="space-y-3">
                        <div>
                            <Label>Descrição/Observação</Label>
                            <Input value={editingCct?.observacoes ?? ""} onChange={(e)=>setEditingCct((p)=> p ? {...p, observacoes:e.target.value} : {observacoes:e.target.value})} autoFocus />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <Label>Sindicato Patronal</Label>
                                <select className="border rounded px-2 py-1 w-full text-sm" value={editingCct?.sindicatoPatronalId ?? ""} onChange={(e)=>setEditingCct((p)=> p ? {...p, sindicatoPatronalId: e.target.value ? Number(e.target.value): undefined} : {sindicatoPatronalId:Number(e.target.value)})}>
                                    <option value="">Selecione</option>
                                    {sindicatos.filter(s=>s.tipo==="patronal").map(s=>(
                                        <option key={s.id} value={s.id}>{s.nome}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <Label>Sindicato Trabalhadores</Label>
                                <select className="border rounded px-2 py-1 w-full text-sm" value={editingCct?.sindicatoTrabalhadoresId ?? ""} onChange={(e)=>setEditingCct((p)=> p ? {...p, sindicatoTrabalhadoresId: e.target.value ? Number(e.target.value): undefined} : {sindicatoTrabalhadoresId:Number(e.target.value)})}>
                                    <option value="">Selecione</option>
                                    {sindicatos.filter(s=>s.tipo==="trabalhadores").map(s=>(
                                        <option key={s.id} value={s.id}>{s.nome}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div><Label>CNAE</Label><Input value={editingCct?.cnae ?? ""} onChange={(e)=>setEditingCct((p)=> p ? {...p, cnae:e.target.value} : {cnae:e.target.value})} /></div>
                            <div><Label>UF</Label><Input value={editingCct?.uf ?? ""} onChange={(e)=>setEditingCct((p)=> p ? {...p, uf:e.target.value} : {uf:e.target.value})} /></div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div><Label>Vigência início</Label><Input type="date" value={editingCct?.vigenciaInicio ?? ""} onChange={(e)=>setEditingCct((p)=> p ? {...p, vigenciaInicio:e.target.value} : {vigenciaInicio:e.target.value})} /></div>
                            <div><Label>Vigência fim</Label><Input type="date" value={editingCct?.vigenciaFim ?? ""} onChange={(e)=>setEditingCct((p)=> p ? {...p, vigenciaFim:e.target.value} : {vigenciaFim:e.target.value})} /></div>
                        </div>
                    </div>
                    <DialogFooter className="pt-4">
                        <Button variant="outline" onClick={()=>{setModalCctOpen(false); setEditingCct(null); setEditingCctId(null)}}>
                            Cancelar
                        </Button>
                        <Button onClick={saveCct} disabled={!editingCct?.sindicatoPatronalId || !editingCct?.sindicatoTrabalhadoresId}>
                            Salvar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog
                open={modalEstabOpen}
                onOpenChange={(open) => {
                    setModalEstabOpen(open)
                    if (!open) { setEditingEstab(null); setEditingEstabId(null) }
                }}
            >
                <DialogContent className="sm:max-w-[640px]">
                    <DialogHeader><DialogTitle>{editingEstabId ? "Editar estabelecimento" : "Novo estabelecimento"}</DialogTitle></DialogHeader>
                    {editingEstab && (
                        <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <Label>Empresa</Label>
                                    <select className="border rounded px-2 py-1 w-full text-sm" value={editingEstab?.empresaId ?? ""} onChange={(e)=>setEditingEstab((p)=> p ? {...p, empresaId:Number(e.target.value)} : {empresaId:Number(e.target.value)})}>
                                        {empresas.map((em)=>(
                                            <option key={em.id} value={em.id}>{getEmpresaNome(em)}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <Label>Tipo</Label>
                                    <select className="border rounded px-2 py-1 w-full text-sm" value={editingEstab?.tipo ?? "filial"} onChange={(e)=>setEditingEstab((p)=> p ? {...p, tipo:e.target.value as any} : {tipo:e.target.value as any})}>
                                        <option value="matriz">Matriz</option>
                                        <option value="filial">Filial</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div><Label>Código/Identificação</Label><Input value={editingEstab?.codigo ?? ""} onChange={(e)=>setEditingEstab((p)=> p ? {...p, codigo:e.target.value} : {codigo:e.target.value})} /></div>
                                <div><Label>CNAE</Label><Input value={editingEstab?.cnae ?? ""} onChange={(e)=>setEditingEstab((p)=> p ? {...p, cnae:e.target.value} : {cnae:e.target.value})} /></div>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div><Label>CNPJ</Label><Input value={editingEstab?.cnpj ?? ""} onChange={(e)=>setEditingEstab((p)=> p ? {...p, cnpj:e.target.value} : {cnpj:e.target.value})} /></div>
                                <div className="flex items-center gap-2">
                                    <Label className="whitespace-nowrap">Status</Label>
                                    <Button size="sm" variant={editingEstab?.ativo === false ? "outline" : "default"} onClick={()=>setEditingEstab((p)=> p ? {...p, ativo:true} : {ativo:true})}>Ativo</Button>
                                    <Button size="sm" variant={editingEstab?.ativo === false ? "default" : "outline"} onClick={()=>setEditingEstab((p)=> p ? {...p, ativo:false} : {ativo:false})}>Inativo</Button>
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                <div><Label>Logradouro</Label><Input value={editingEstab?.logradouro ?? ""} onChange={(e)=>setEditingEstab((p)=> p ? {...p, logradouro:e.target.value} : {logradouro:e.target.value})} /></div>
                                <div><Label>Número</Label><Input value={editingEstab?.numero ?? ""} onChange={(e)=>setEditingEstab((p)=> p ? {...p, numero:e.target.value} : {numero:e.target.value})} /></div>
                                <div><Label>Complemento</Label><Input value={editingEstab?.complemento ?? ""} onChange={(e)=>setEditingEstab((p)=> p ? {...p, complemento:e.target.value} : {complemento:e.target.value})} /></div>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                <div><Label>Bairro</Label><Input value={editingEstab?.bairro ?? ""} onChange={(e)=>setEditingEstab((p)=> p ? {...p, bairro:e.target.value} : {bairro:e.target.value})} /></div>
                                <div><Label>Cidade</Label><Input value={editingEstab?.cidade ?? ""} onChange={(e)=>setEditingEstab((p)=> p ? {...p, cidade:e.target.value} : {cidade:e.target.value})} /></div>
                                <div><Label>UF</Label><Input value={editingEstab?.estado ?? ""} onChange={(e)=>setEditingEstab((p)=> p ? {...p, estado:e.target.value} : {estado:e.target.value})} /></div>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                <div><Label>CEP</Label><Input value={editingEstab?.cep ?? ""} onChange={(e)=>setEditingEstab((p)=> p ? {...p, cep:e.target.value} : {cep:e.target.value})} /></div>
                                <div>
                                    <Label>Sindicato Patronal</Label>
                                    <select className="border rounded px-2 py-1 w-full text-sm" value={editingEstab?.sindicatoPatronalId ?? ""} onChange={(e)=>setEditingEstab((p)=> p ? {...p, sindicatoPatronalId: e.target.value ? Number(e.target.value): undefined} : {sindicatoPatronalId:Number(e.target.value)})}>
                                        <option value="">Selecione</option>
                                        {sindicatos.filter(s=>s.tipo==="patronal").map(s=>(
                                            <option key={s.id} value={s.id}>{s.nome}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <Label>Sindicato Trabalhadores</Label>
                                    <select className="border rounded px-2 py-1 w-full text-sm" value={editingEstab?.sindicatoTrabalhadoresId ?? ""} onChange={(e)=>setEditingEstab((p)=> p ? {...p, sindicatoTrabalhadoresId: e.target.value ? Number(e.target.value): undefined} : {sindicatoTrabalhadoresId:Number(e.target.value)})}>
                                        <option value="">Selecione</option>
                                        {sindicatos.filter(s=>s.tipo==="trabalhadores").map(s=>(
                                            <option key={s.id} value={s.id}>{s.nome}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}
                    <DialogFooter className="pt-4">
                        <Button variant="outline" onClick={()=>{setModalEstabOpen(false); setEditingEstab(null); setEditingEstabId(null)}}>
                            Cancelar
                        </Button>
                        <Button onClick={saveEstab} disabled={!editingEstab?.cnpj || !editingEstab?.cnae}>
                            Salvar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

/* CARGOS */

function CargosView() {
    const [cargos, setCargos] = useState<Cargo[]>([])
    const [search, setSearch] = useState("")
    const [loading, setLoading] = useState(false)

    const [editingId, setEditingId] = useState<number | null>(null)
    const [editingCargo, setEditingCargo] = useState<Cargo | null>(null)

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

    const startEdit = (c: Cargo) => {
        setEditingId(c.id ?? null)
        setEditingCargo({ ...c })
    }

    const cancelEdit = () => {
        setEditingId(null)
        setEditingCargo(null)
    }

    const saveEdit = async () => {
        if (!editingCargo || !editingId) return
        try {
            const updated = await putJSON<Cargo>(`/api/cargos/${editingId}`, editingCargo)
            setCargos((prev) => prev.map((c) => (c.id === editingId ? updated : c)))
            setEditingId(null)
            setEditingCargo(null)
        } catch (e) {
            console.error("Erro ao atualizar cargo:", e)
            alert("Erro ao atualizar cargo. Verifique os logs da API.")
        }
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
                                filtered.map((c) => {
                                    const isEditing = editingId === c.id
                                    const row = isEditing && editingCargo ? editingCargo : c

                                    return (
                                        <tr key={c.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-3 text-sm font-medium text-gray-900">
                                                {isEditing ? (
                                                    <Input
                                                        className="h-8"
                                                        value={row.titulo ?? ""}
                                                        onChange={(e) =>
                                                            setEditingCargo((prev) =>
                                                                prev ? { ...prev, titulo: e.target.value } : prev,
                                                            )
                                                        }
                                                    />
                                                ) : (
                                                    row.titulo
                                                )}
                                            </td>
                                            <td className="px-6 py-3 text-sm text-gray-700">
                                                {isEditing ? (
                                                    <Input
                                                        className="h-8"
                                                        value={row.area ?? ""}
                                                        onChange={(e) =>
                                                            setEditingCargo((prev) =>
                                                                prev ? { ...prev, area: e.target.value } : prev,
                                                            )
                                                        }
                                                    />
                                                ) : (
                                                    row.area
                                                )}
                                            </td>
                                            <td className="px-6 py-3 text-sm text-gray-700">
                                                {isEditing ? (
                                                    <Input
                                                        className="h-8"
                                                        value={row.nivel ?? ""}
                                                        onChange={(e) =>
                                                            setEditingCargo((prev) =>
                                                                prev ? { ...prev, nivel: e.target.value } : prev,
                                                            )
                                                        }
                                                    />
                                                ) : (
                                                    row.nivel
                                                )}
                                            </td>
                                            <td className="px-6 py-3 text-sm text-gray-700">
                                                {isEditing ? (
                                                    <Input
                                                        className="h-8"
                                                        type="number"
                                                        value={row.pontos ?? ""}
                                                        onChange={(e) =>
                                                            setEditingCargo((prev) =>
                                                                prev ? { ...prev, pontos: Number(e.target.value) } : prev,
                                                            )
                                                        }
                                                    />
                                                ) : (
                                                    row.pontos
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
                                                        {isEditing ? (
                                                            <>
                                                                <DropdownMenuItem onClick={saveEdit}>
                                                                    Salvar
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem onClick={cancelEdit}>
                                                                    Cancelar
                                                                </DropdownMenuItem>
                                                                <DropdownMenuSeparator />
                                                            </>
                                                        ) : (
                                                            <>
                                                                <DropdownMenuItem onClick={() => startEdit(c)}>
                                                                    Editar
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem onClick={() => alert("Em breve: ver trilha de carreira")}>
                                                                    Ver trilha de carreira
                                                                </DropdownMenuItem>
                                                                <DropdownMenuSeparator />
                                                            </>
                                                        )}
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
                                    )
                                })
                            )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* Sindicatos */}
            <Card>
                <CardHeader className="px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-base">Sindicatos</CardTitle>
                            <CardDescription>Patronal e dos Trabalhadores para compor CCTs.</CardDescription>
                        </div>
                        <Button size="sm" onClick={openNovoSindicato}>+ Novo sindicato</Button>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">CNPJ</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cidade/UF</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ações</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                            {loadingSindicatos ? (
                                <tr><td className="px-6 py-3 text-sm text-gray-500" colSpan={5}>Carregando sindicatos...</td></tr>
                            ) : sindicatos.length === 0 ? (
                                <tr><td className="px-6 py-3 text-sm text-gray-500" colSpan={5}>Nenhum sindicato cadastrado.</td></tr>
                            ) : sindicatos.map((s) => (
                                <tr key={s.id}>
                                    <td className="px-6 py-3 text-sm text-gray-900">{s.nome}</td>
                                    <td className="px-6 py-3 text-sm text-gray-700 capitalize">{s.tipo}</td>
                                    <td className="px-6 py-3 text-sm text-gray-700">{s.cnpj ?? "-"}</td>
                                    <td className="px-6 py-3 text-sm text-gray-700">{s.cidade ?? "-"} {s.uf ?? ""}</td>
                                    <td className="px-6 py-3 text-sm text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger>
                                                <Button variant="ghost" size="icon" className="h-7 w-7"><MoreHorizontal className="h-4 w-4" /></Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={()=>startEditSindicato(s)}>Editar</DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem className="text-red-600" onClick={()=>deleteSindicato(s.id)}>
                                                    <Trash2 className="h-3 w-3 mr-1" />Excluir
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* CCTs */}
            <Card>
                <CardHeader className="px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-base">Convenções Coletivas (CCTs)</CardTitle>
                            <CardDescription>Vínculo entre sindicatos e regras por CNAE/região.</CardDescription>
                        </div>
                        <Button size="sm" onClick={openNovaCct}>+ Nova CCT</Button>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Descrição</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sind. Patronal</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sind. Trabalhadores</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vigência</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ações</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                            {loadingCcts ? (
                                <tr><td className="px-6 py-3 text-sm text-gray-500" colSpan={5}>Carregando CCTs...</td></tr>
                            ) : ccts.length === 0 ? (
                                <tr><td className="px-6 py-3 text-sm text-gray-500" colSpan={5}>Nenhuma CCT cadastrada.</td></tr>
                            ) : ccts.map((c) => {
                                const sindP = sindicatos.find((s)=>s.id===c.sindicatoPatronalId)
                                const sindT = sindicatos.find((s)=>s.id===c.sindicatoTrabalhadoresId)
                                return (
                                    <tr key={c.id}>
                                        <td className="px-6 py-3 text-sm text-gray-900">{c.observacoes || c.cnae || "-"}</td>
                                        <td className="px-6 py-3 text-sm text-gray-700">{sindP?.nome ?? "-"}</td>
                                        <td className="px-6 py-3 text-sm text-gray-700">{sindT?.nome ?? "-"}</td>
                                        <td className="px-6 py-3 text-sm text-gray-700">
                                            {c.vigenciaInicio ? formatDate(c.vigenciaInicio) : "-"}{" "}
                                            {c.vigenciaFim ? `até ${formatDate(c.vigenciaFim)}` : ""}
                                        </td>
                                        <td className="px-6 py-3 text-sm text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger><Button variant="ghost" size="icon" className="h-7 w-7"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={()=>startEditCct(c)}>Editar</DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem className="text-red-600" onClick={()=>deleteCct(c.id)}>
                                                        <Trash2 className="h-3 w-3 mr-1" />Excluir
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </td>
                                    </tr>
                                )
                            })}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* Estabelecimentos */}
            <Card>
                <CardHeader className="px-6 py-4">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                        <div>
                            <CardTitle className="text-base">Estabelecimentos</CardTitle>
                            <CardDescription>Filiais/matrizes vinculadas à empresa.</CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                            <select
                                className="border rounded px-2 py-1 text-sm"
                                value={selectedEmpresaId ?? ""}
                                onChange={(e)=>setSelectedEmpresaId(Number(e.target.value))}
                            >
                                {empresas.map((em)=>(
                                    <option key={em.id} value={em.id}>{getEmpresaNome(em)}</option>
                                ))}
                            </select>
                            <Button size="sm" onClick={openNovoEstab}>+ Novo estabelecimento</Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">CNPJ</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Código</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">CNAE</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sind. Patronal</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sind. Trab.</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ações</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                            {loadingEstabs ? (
                                <tr><td className="px-6 py-3 text-sm text-gray-500" colSpan={8}>Carregando estabelecimentos...</td></tr>
                            ) : estabelecimentos.filter((e)=>!selectedEmpresaId || e.empresaId===selectedEmpresaId).length === 0 ? (
                                <tr><td className="px-6 py-3 text-sm text-gray-500" colSpan={8}>Nenhum estabelecimento para esta empresa.</td></tr>
                            ) : estabelecimentos.filter((e)=>!selectedEmpresaId || e.empresaId===selectedEmpresaId).map((est)=> {
                                const sindP = sindicatos.find((s)=>s.id===est.sindicatoPatronalId)
                                const sindT = sindicatos.find((s)=>s.id===est.sindicatoTrabalhadoresId)
                                return (
                                    <tr key={est.id}>
                                        <td className="px-6 py-3 text-sm text-gray-900">{est.cnpj}</td>
                                        <td className="px-6 py-3 text-sm text-gray-700">{est.codigo ?? "-"}</td>
                                        <td className="px-6 py-3 text-sm text-gray-700 capitalize">{est.tipo}</td>
                                        <td className="px-6 py-3 text-sm text-gray-700">
                                            <Badge variant={est.ativo === false ? "secondary" : "outline"}>
                                                {est.ativo === false ? "Inativo" : "Ativo"}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-3 text-sm text-gray-700">{est.cnae ?? "-"}</td>
                                        <td className="px-6 py-3 text-sm text-gray-700">{sindP?.nome ?? "-"}</td>
                                        <td className="px-6 py-3 text-sm text-gray-700">{sindT?.nome ?? "-"}</td>
                                        <td className="px-6 py-3 text-sm text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger><Button variant="ghost" size="icon" className="h-7 w-7"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={()=>startEditEstab(est)}>Editar</DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem className="text-red-600" onClick={()=>deleteEstab(est.id)}>
                                                        <Trash2 className="h-3 w-3 mr-1" />Excluir
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </td>
                                    </tr>
                                )
                            })}
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

    const [editingId, setEditingId] = useState<number | null>(null)
    const [editingFuncionario, setEditingFuncionario] = useState<any | null>(null)

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
            funcionarios.map((f: any) => ({
                ID: f.id,
                Nome: f.nome,
                Cargo: f.cargo_nome,
                Admissao: f.admissao,
                Salario: f.salario,
                Status: f.status,
            })),
            "funcionarios.csv",
        )
    }

    const startEdit = (f: any) => {
        setEditingId(f.id ?? null)
        setEditingFuncionario({ ...f })
    }

    const cancelEdit = () => {
        setEditingId(null)
        setEditingFuncionario(null)
    }

    const saveEdit = async () => {
        if (!editingFuncionario || !editingId) return
        try {
            const updated = await putJSON<any>(`/api/funcionarios/${editingId}`, editingFuncionario)
            setFuncionarios((prev) => prev.map((f) => (f.id === editingId ? updated : f)))
            setEditingId(null)
            setEditingFuncionario(null)
        } catch (e) {
            console.error("Erro ao atualizar funcionário:", e)
            alert("Erro ao atualizar funcionário. Verifique os logs da API.")
        }
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
                                filtered.map((f: any) => {
                                    const isEditing = editingId === f.id
                                    const row = isEditing && editingFuncionario ? editingFuncionario : f

                                    return (
                                        <tr key={f.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-3 text-sm font-medium text-gray-900">
                                                {isEditing ? (
                                                    <Input
                                                        className="h-8"
                                                        value={row.nome ?? ""}
                                                        onChange={(e) =>
                                                            setEditingFuncionario((prev: any) =>
                                                                prev ? { ...prev, nome: e.target.value } : prev,
                                                            )
                                                        }
                                                    />
                                                ) : (
                                                    row.nome
                                                )}
                                            </td>
                                            <td className="px-6 py-3 text-sm text-gray-700">
                                                {(row as any).cargo_nome ?? <span className="text-gray-400">Sem cargo</span>}
                                            </td>
                                            <td className="px-6 py-3 text-sm text-gray-700">
                                                {row.area ?? <span className="text-gray-400">-</span>}
                                            </td>
                                            <td className="px-6 py-3 text-sm text-gray-700">
                                                {row.gestor ?? <span className="text-gray-400">-</span>}
                                            </td>
                                            <td className="px-6 py-3 text-sm text-gray-700">
                                                {isEditing ? (
                                                    <Input
                                                        className="h-8"
                                                        value={row.admissao ?? ""}
                                                        onChange={(e) =>
                                                            setEditingFuncionario((prev: any) =>
                                                                prev ? { ...prev, admissao: e.target.value } : prev,
                                                            )
                                                        }
                                                    />
                                                ) : row.admissao ? (
                                                    formatDate(row.admissao)
                                                ) : (
                                                    "-"
                                                )}
                                            </td>
                                            <td className="px-6 py-3 text-sm text-gray-700">
                                                {isEditing ? (
                                                    <Input
                                                        className="h-8"
                                                        type="number"
                                                        value={row.salario ?? ""}
                                                        onChange={(e) =>
                                                            setEditingFuncionario((prev: any) =>
                                                                prev ? { ...prev, salario: Number(e.target.value) } : prev,
                                                            )
                                                        }
                                                    />
                                                ) : row.salario ? (
                                                    formatCurrency(row.salario)
                                                ) : (
                                                    "-"
                                                )}
                                            </td>
                                            <td className="px-6 py-3 text-sm text-gray-700">
                                                {isEditing ? (
                                                    <div className="flex items-center gap-2">
                                                        <Button
                                                            variant={row.status?.toLowerCase() === "ativo" ? "default" : "outline"}
                                                            size="sm"
                                                            onClick={() =>
                                                                setEditingFuncionario((prev: any) =>
                                                                    prev ? { ...prev, status: "ativo" } : prev,
                                                                )
                                                            }
                                                        >
                                                            Ativo
                                                        </Button>
                                                        <Button
                                                            variant={row.status?.toLowerCase() === "inativo" ? "default" : "outline"}
                                                            size="sm"
                                                            onClick={() =>
                                                                setEditingFuncionario((prev: any) =>
                                                                    prev ? { ...prev, status: "inativo" } : prev,
                                                                )
                                                            }
                                                        >
                                                            Inativo
                                                        </Button>
                                                    </div>
                                                ) : row.status ? (
                                                    <Badge
                                                        variant={row.status?.toLowerCase() === "ativo" ? "default" : "outline"}
                                                        className={
                                                            row.status?.toLowerCase() === "ativo"
                                                                ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                                                                : ""
                                                        }
                                                    >
                                                        {row.status}
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
                                                        {isEditing ? (
                                                            <>
                                                                <DropdownMenuItem onClick={saveEdit}>
                                                                    Salvar
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem onClick={cancelEdit}>
                                                                    Cancelar
                                                                </DropdownMenuItem>
                                                                <DropdownMenuSeparator />
                                                            </>
                                                        ) : (
                                                            <>
                                                                <DropdownMenuItem onClick={() => startEdit(f)}>
                                                                    Editar
                                                                </DropdownMenuItem>
                                                                <DropdownMenuSeparator />
                                                            </>
                                                        )}
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
                                    )
                                })
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
