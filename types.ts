export type Empresa = {
  id:number
  code?:string
  name:string      // razão social
  razaoSocial?:string
  fantasia:string  // nome fantasia
  nomeFantasia?:string
  status?:string
  estabelecimentoMatrizId?:number|null
}

export type Estabelecimento = {
  id:number
  empresaId:number
  codigo?:string
  tipo:'matriz'|'filial'
  cnpj:string
  cnae?:string
  logradouro?:string
  numero?:string
  complemento?:string
  bairro?:string
  cidade?:string
  estado?:string
  cep?:string
  ativo?:boolean
  sindicatoPatronalId?:number
  sindicatoTrabalhadoresId?:number
  consolidarGuiasNaMatriz?:boolean
}

export type CentroCusto = {
  id:number
  estabelecimentoId:number
  codigo:string
  customCode?:string
  descricao:string
  subdivisao?:string
  ativo:boolean
}

export type Sindicato = {
  id:number
  nome:string
  tipo:'patronal'|'trabalhadores'
  cnpj?:string
  cidade?:string
  uf?:string
  sindicatoPatronalId?:number
  ativo?:boolean
}

export type Convencao = {
  id:number
  sindicatoTrabalhadoresId:number
  sindicatoPatronalId?:number
  cnae?:string
  cidade?:string
  uf?:string
  vigenciaInicio?:string
  vigenciaFim?:string
  documentoUrl?:string
  observacoes?:string
}

export type QuadroOrcamentario = {
  id:number
  estabelecimentoId:number
  centroCustoId:number
  ano:number
  mes:number
  valorOrcado:number
  observacao?:string
  ativo?:boolean
}

export type Cargo = { id:number; titulo:string; area:string; nivel:'Júnior'|'Pleno'|'Sênior'; pontos:number }

export type Funcionario = {
  id:number
  nome:string
  cargo:string
  estabelecimentoId:number
  centroCustoId:number
  gestor:string
  admissao:string
  salario:number
  status:string
}

export type TabelaSalarial = { id:number; nome:string; cargo:string; faixaMin:number; faixaMed:number; faixaMax:number; moeda:string }
