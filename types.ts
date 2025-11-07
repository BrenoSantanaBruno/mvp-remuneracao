
export type Empresa = { id:number; name:string; fantasia:string; cnpj:string; code?:string; status?:string }
export type Cargo = { id:number; titulo:string; area:string; nivel:'Júnior'|'Pleno'|'Sênior'; pontos:number }
export type Funcionario = { id:number; nome:string; cargo:string; area:string; gestor:string; admissao:string; salario:number; status:string }
export type TabelaSalarial = { id:number; nome:string; cargo:string; faixaMin:number; faixaMed:number; faixaMax:number; moeda:string }
