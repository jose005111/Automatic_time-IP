export const IDADE_MUNICIPE = 18;

export const MENSAGEM_IDADE_INVALIDA =
    'O munícipe deve ter exatamente 18 anos de idade.';

const paraDataLocal = (dataNascimento?: string | null): Date | null => {
    const valor = dataNascimento?.trim().slice(0, 10);
    if (!valor || !/^\d{4}-\d{2}-\d{2}$/.test(valor)) return null;

    const [ano, mes, dia] = valor.split('-').map(Number);
    const data = new Date(ano, mes - 1, dia, 12);
    if (
        data.getFullYear() !== ano ||
        data.getMonth() !== mes - 1 ||
        data.getDate() !== dia
    )
        return null;

    return data;
};

export const calcularIdade = (
    dataNascimento?: string | null,
): number | null => {
    const nascimento = paraDataLocal(dataNascimento);
    if (!nascimento) return null;

    const hoje = new Date();
    let idade = hoje.getFullYear() - nascimento.getFullYear();
    if (
        hoje.getMonth() < nascimento.getMonth() ||
        (hoje.getMonth() === nascimento.getMonth() &&
            hoje.getDate() < nascimento.getDate())
    )
        idade--;

    return idade;
};

export const temIdadeMunicipeValida = (
    dataNascimento?: string | null,
): boolean => calcularIdade(dataNascimento) === IDADE_MUNICIPE;

const paraValorInput = (data: Date): string =>
    `${data.getFullYear().toString().padStart(4, '0')}-${(data.getMonth() + 1).toString().padStart(2, '0')}-${data.getDate().toString().padStart(2, '0')}`;

export const limitesDataNascimentoMunicipe = (): {
    min: string;
    max: string;
} => {
    const hoje = new Date();
    const max = new Date(
        hoje.getFullYear() - IDADE_MUNICIPE,
        hoje.getMonth(),
        hoje.getDate(),
    );
    const min = new Date(
        hoje.getFullYear() - IDADE_MUNICIPE - 1,
        hoje.getMonth(),
        hoje.getDate() + 1,
    );

    return { min: paraValorInput(min), max: paraValorInput(max) };
};
