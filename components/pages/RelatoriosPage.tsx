"use client"

import ReportButton from "@/components/feature/ReportButton"

export default function RelatoriosPage() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border bg-white p-4">
          <h3 className="mb-2 text-lg font-semibold">Relatório de Cargos</h3>
          <ReportButton
            label="Cargos"
            path="/api/cargos"
            filename="cargos.csv"
            className="bg-black text-white"
          />
        </div>

        <div className="rounded-xl border bg-white p-4">
          <h3 className="mb-2 text-lg font-semibold">Relatório de Funcionários</h3>
          <ReportButton
            label="Funcionários"
            path="/api/funcionarios"
            filename="funcionarios.csv"
            className="bg-black text-white"
          />
        </div>

        <div className="rounded-xl border bg-white p-4">
          <h3 className="mb-2 text-lg font-semibold">Relatório Salarial</h3>
          <ReportButton
            label="Salários"
            path="/api/funcionarios"
            filename="salarios.csv"
            className="bg-black text-white"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border bg-white p-4">
          <h3 className="mb-2 text-lg font-semibold">Estrutura Organizacional</h3>
          <ReportButton
            label="Estrutura"
            path="/api/empresas"
            filename="empresas.csv"
            className="bg-black text-white"
          />
        </div>

        <div className="rounded-xl border bg-white p-4">
          <h3 className="mb-2 text-lg font-semibold">Avaliações de Cargos</h3>
          <ReportButton
            label="Avaliações"
            path="/api/avaliacoes"
            filename="avaliacoes.csv"
            className="bg-black text-white"
          />
        </div>
      </div>
    </div>
  )
}
