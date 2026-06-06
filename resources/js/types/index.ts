export type * from './auth';
export type * from './navigation';
export type * from './ui';

import type { Auth } from './auth';

export type SharedData = {
    name: string;
    auth: Auth;
    sidebarOpen: boolean;
    [key: string]: unknown;
};

// =============================================
// TIPOS RELACIONADOS
// =============================================

export interface Provincia {
    id: number;
    nome: string;
    created_at?: string;
    updated_at?: string;
}

export interface Municipio {
    id: number;
    nome: string;
    id_provincia: number;
    provincia?: Provincia;
    created_at?: string;
    updated_at?: string;
}

export interface Progenitor {
    id: number;
    nome_completo: string;
    data_nascimento?: string;
    naturalidade?: string;
    profissao?: string;
    sexo?: 'M' | 'F';
    created_at?: string;
    updated_at?: string;
}

// =============================================
// DADOS COMPLEMENTARES DO MUNÍCIPE
// =============================================

export interface DadosBiografico {
    id?: number;
    id_municipe?: number;
    nip?: string;
    assento_numero?: string;
    registro_civil?: string;
    registro_numero?: string;
    cedula_numero?: string;
    numero_filhos?: number;
    vencimento?: number;
    ramo_actividade?: string;
    ramo?: string;
    ano_incorporacao?: number;
    ano_abandono?: number;
    ano_servico?: number;
    modo_vida?: string;
    created_at?: string;
    updated_at?: string;
}

export interface DadosComplementar {
    id?: number;
    id_municipe?: number;
    caixa_postal?: string;
    nif?: string;
    encargo_familiar?: number;
    habilitacao_literaria?: string;
    profissao?: string;
    numero_irmaos?: number;
    entidade_emissora_bi?: string;
    numero_carta_conducao?: string;
    data_emissao_carta?: string;
    data_validade_carta?: string;
    atributo?: string;
    created_at?: string;
    updated_at?: string;
}

export interface Endereco {
    id?: number;
    id_municipe?: number;
    morada?: string;
    localidade?: string;
    comuna?: string;
    id_provincia?: number;
    id_municipio?: number;
    provincia?: Provincia;
    municipio?: Municipio;
    created_at?: string;
    updated_at?: string;
}

// =============================================
// RECRUTAMENTO E TRANSFERÊNCIA
// =============================================

export interface Transferencia {
    id: number;
    id_recrutamento: number;
    data_solicitacao: string;
    id_municipio_destino?: number;
    local_destino?: string;
    estado: number; // 0 = Pendente, 1 = Aprovada, 2 = Rejeitada
    data_aprovacao?: string;
    id_user_aprovou?: number;
    municipio_destino?: Municipio;
    created_at?: string;
    updated_at?: string;
}

export interface Recrutamento {
    id: number;
    id_municipe: number;
    data_recruta: string;
    observacoes?: string;
    estado: number; // 0 = Pendente, 1 = Aprovado, 2 = Rejeitado
    created_at?: string;
    updated_at?: string;
    transferencias?: Transferencia[];
}

// =============================================
// MUNÍCIPE (Tipo Principal)
// =============================================

export interface Municipe {
    id: number;
    id_user?: number;
    nome_completo: string;
    data_nascimento: string;
    sexo: 'M' | 'F';
    estado_civil?: string;
    naturalidade?: string;
    id_municipio_naturalidade?: number;
    bi_numero?: string;
    bi_data_emissao?: string;
    bi_data_validade?: string;
    telefone?: string;
    celular?: string;
    id_pai?: number;
    id_mae?: number;

    // Relações
    municipio_naturalidade?: Municipio;
    pai?: Progenitor;
    mae?: Progenitor;
    dados_biograficos?: DadosBiografico;
    dados_complementares?: DadosComplementar;
    endereco?: Endereco;
    recrutamentos?: Recrutamento[];

    created_at?: string;
    updated_at?: string;
}

// =============================================
// TIPOS AUXILIARES
// =============================================

export interface MunicipeFilters {
    search?: string;
    sexo?: string;
    estado_civil?: string;
    has_bi?: string;
}

export interface MunicipeStats {
    total: number;
    masculino: number;
    feminino: number;
    com_bi: number;
}

export interface PaginatedMunicipes {
    data: Municipe[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}
