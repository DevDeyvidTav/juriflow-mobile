import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { deleteCadastroFiles, keepFile } from '../data/files';
import { pickDocument, pickFromCamera, pickFromLibrary, type PickedFile } from '../data/pick-file';
import { fileProblem, isHealthBenefit, visibleBenefitFiles } from '../lib/benefits';
import { findSameCpf } from '../lib/duplicate';
import { createId } from '../lib/id';
import { maskCpf, maskDate, maskDateTime, maskPhone } from '../lib/masks';
import { buildPayload } from '../lib/payload';
import { isFieldRequired } from '../lib/required';
import { emptyForm, type Cadastro, type FormState, type LocalFile } from '../lib/types';
import { validateForm } from '../lib/validate';
import { useQueue } from '../state/queue';
import { useSession } from '../state/session';
import { colors } from '../theme/colors';
import { Button } from '../ui/Button';
import { Card } from '../ui/Screen';
import { Notice } from '../ui/Notice';
import { SectionTitle } from '../ui/SectionTitle';
import { SelectField } from '../ui/SelectField';
import { TextField } from '../ui/TextField';
import { AFTER_BENEFIT, BEFORE_BENEFIT, optionLabel } from './fields';

type DraftFile = PickedFile & { label: string };

function maskValue(key: string, value: string): string {
  if (key === 'cpf') return maskCpf(value);
  if (key === 'primaryContact' || key === 'secondaryContact') return maskPhone(value);
  if (key === 'captureDate') return maskDate(value);
  if (key.endsWith('ScheduledAt')) return maskDateTime(value);
  return value;
}

export function CadastroScreen({ onSaved }: { onSaved: () => void }) {
  const { user } = useSession().session!;
  const queue = useQueue();
  const [form, setForm] = useState<FormState>(emptyForm());
  const [kanbanId, setKanbanId] = useState('');
  const [benefitId, setBenefitId] = useState('');
  const [files, setFiles] = useState<Record<string, DraftFile>>({});
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  const kanban = queue.catalog.kanbans.find((item) => item.id === kanbanId);
  const required = kanban?.requiredFields;
  const benefit = queue.catalog.benefits.find((item) => item.id === benefitId) ?? null;
  const fileSlots = visibleBenefitFiles(benefit);
  const req = (key: string) => isFieldRequired(required, key);

  useEffect(() => {
    if (kanbanId || queue.catalog.kanbans.length === 0) return;
    const principal = queue.catalog.kanbans.find((item) => item.slug === 'principal');
    setKanbanId(principal?.id ?? queue.catalog.kanbans[0].id);
  }, [kanbanId, queue.catalog.kanbans]);

  function setField(key: keyof FormState, value: string) {
    setForm((current) => ({ ...current, [key]: maskValue(key, value) }));
  }

  function chooseBenefit(id: string) {
    const next = queue.catalog.benefits.find((item) => item.id === id);
    setBenefitId(id);
    setFiles({});
    setForm((current) => ({ ...current, targetBenefit: next?.name ?? '' }));
  }

  async function attach(label: string, pick: () => Promise<PickedFile | null>) {
    setMessage('');
    try {
      const file = await pick();
      if (!file) return;
      const problem = fileProblem(file.mime, file.size);
      if (problem) {
        setMessage(problem);
        return;
      }
      setFiles((current) => ({ ...current, [label]: { ...file, label } }));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Não foi possível anexar o arquivo.');
    }
  }

  function clearForm() {
    setForm(emptyForm());
    setFiles({});
    setBenefitId('');
    setMessage('');
  }

  async function submit() {
    setMessage('');
    const error = validateForm(form, kanbanId, required);
    if (error) {
      setMessage(error);
      return;
    }
    if (findSameCpf(queue.items, form.cpf)) {
      setMessage('Já existe um cadastro com este CPF neste aparelho.');
      return;
    }
    setSaving(true);
    const id = createId();
    try {
      const stored: LocalFile[] = [];
      for (const file of Object.values(files)) {
        const fileId = createId();
        stored.push({
          id: fileId,
          label: file.label,
          name: file.name,
          mime: file.mime,
          uri: await keepFile(id, fileId, file.uri, file.name),
        });
      }
      const item: Cadastro = {
        id,
        status: 'pending',
        userId: user.id,
        userName: user.name,
        savedAt: new Date().toISOString(),
        kanbanId,
        kanbanName: kanban?.name ?? '',
        payload: buildPayload(form, kanbanId, id),
        files: stored,
      };
      await queue.save(item);
      clearForm();
      onSaved();
      if (queue.online) void queue.syncNow();
    } catch (error) {
      await deleteCadastroFiles(id);
      setMessage(error instanceof Error ? error.message : 'Não foi possível guardar o cadastro.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>Cadastro de Cliente</Text>
      <Text style={styles.subtitle}>
        O cadastro fica neste aparelho e entra na fila. A nuvem recebe quando houver internet.
      </Text>
      {queue.catalog.kanbans.length === 0 ? (
        <Notice text="Conecte-se uma vez para carregar os kanbans e os benefícios." />
      ) : null}
      {message ? <Notice text={message} tone="error" /> : null}

      <Card>
        <SectionTitle>Kanban de destino</SectionTitle>
        <SelectField
          label="Kanban"
          required
          value={kanbanId}
          placeholder="Selecione o kanban"
          options={queue.catalog.kanbans.map((item) => ({ value: item.id, label: item.name }))}
          onChange={setKanbanId}
        />
        <Text style={styles.help}>O cliente entra na primeira etapa deste kanban.</Text>
      </Card>

      {BEFORE_BENEFIT.map((section) => (
        <Card key={section.title}>
          <SectionTitle>{section.title}</SectionTitle>
          {section.fields.map((field) =>
            field.kind === 'select' ? (
              <SelectField
                key={field.key}
                label={field.label}
                required={req(field.key)}
                value={form[field.key]}
                options={field.options.map((option) => ({ value: option, label: optionLabel(option) }))}
                onChange={(value) => setField(field.key, value)}
              />
            ) : (
              <TextField
                key={field.key}
                label={field.label}
                required={req(field.key)}
                value={form[field.key]}
                placeholder={field.placeholder}
                multiline={field.kind === 'area'}
                secure={field.key === 'govPassword'}
                onChangeText={(value) => setField(field.key, value)}
              />
            ),
          )}
          {section.title === 'Contatos' ? (
            <Text style={styles.help}>A senha Gov.br fica visível para a equipe na ficha do cliente.</Text>
          ) : null}
        </Card>
      ))}

      <Card>
        <SectionTitle>Histórico Previdenciário</SectionTitle>
        <SelectField
          label="Já deu entrada no INSS?"
          required={req('hasINSSRequest')}
          value={form.hasINSSRequest}
          options={[
            { value: 'NAO', label: 'Não' },
            { value: 'SIM', label: 'Sim' },
          ]}
          onChange={(value) => setField('hasINSSRequest', value)}
        />
        <SelectField
          label="Já deu entrada na justiça?"
          required={req('hasJusticeRequest')}
          value={form.hasJusticeRequest}
          options={[
            { value: 'NAO_SABE', label: 'Não sabe informar' },
            { value: 'NAO', label: 'Não' },
            { value: 'SIM', label: 'Sim' },
          ]}
          onChange={(value) => setField('hasJusticeRequest', value)}
        />
      </Card>

      <Card>
        <SectionTitle>Benefício Pretendido</SectionTitle>
        {queue.catalog.benefits.length > 0 ? (
          <SelectField
            label="Tipo de benefício"
            required={req('targetBenefit')}
            value={benefitId}
            placeholder="Selecione o tipo de benefício"
            options={queue.catalog.benefits.map((item) => ({ value: item.id, label: item.name }))}
            onChange={chooseBenefit}
          />
        ) : (
          <TextField
            label="Tipo de benefício"
            required={req('targetBenefit')}
            value={form.targetBenefit}
            placeholder="Ex: Aposentadoria por invalidez"
            onChangeText={(value) => setField('targetBenefit', value)}
          />
        )}
      </Card>

      {AFTER_BENEFIT.map((section) => (
        <Card key={section.title}>
          <SectionTitle>{section.title}</SectionTitle>
          {section.title === 'Doenças, tempo e observações' && isHealthBenefit(form.targetBenefit) ? (
            <Notice text="Benefício por saúde — preencha os campos marcados como obrigatórios neste kanban." />
          ) : null}
          {section.fields.map((field) =>
            field.kind === 'select' ? (
              <SelectField
                key={field.key}
                label={field.label}
                required={req(field.key)}
                value={form[field.key]}
                options={field.options.map((option) => ({ value: option, label: optionLabel(option) }))}
                onChange={(value) => setField(field.key, value)}
              />
            ) : (
              <TextField
                key={field.key}
                label={field.label}
                required={req(field.key)}
                value={form[field.key]}
                placeholder={field.placeholder}
                multiline={field.kind === 'area'}
                onChangeText={(value) => setField(field.key, value)}
              />
            ),
          )}
        </Card>
      ))}

      {fileSlots.length > 0 ? (
        <Card>
          <SectionTitle>Documentos e Fotos</SectionTitle>
          <Text style={styles.help}>Opcional. O arquivo fica no aparelho até a sincronização.</Text>
          {fileSlots.map((slot) => (
            <View key={slot.id} style={styles.fileBox}>
              <Text style={styles.fileLabel}>{slot.label}</Text>
              <Text style={styles.help}>
                {files[slot.label] ? files[slot.label].name : `JPG, PNG ou PDF (${slot.acceptedTypes})`}
              </Text>
              <View style={styles.row}>
                <View style={styles.flex}><Button tone="ghost" label="Câmera" onPress={() => attach(slot.label, pickFromCamera)} /></View>
                <View style={styles.flex}><Button tone="ghost" label="Galeria" onPress={() => attach(slot.label, pickFromLibrary)} /></View>
                <View style={styles.flex}><Button tone="ghost" label="Arquivo" onPress={() => attach(slot.label, pickDocument)} /></View>
              </View>
            </View>
          ))}
        </Card>
      ) : null}

      <Button label={saving ? 'Guardando...' : 'Guardar cadastro'} onPress={submit} disabled={saving || !queue.ready} />
      <Button label="Limpar formulário" tone="ghost" onPress={clearForm} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 16,
    gap: 14,
    paddingBottom: 40,
  },
  title: {
    color: colors.white,
    fontSize: 24,
    fontWeight: '700',
  },
  subtitle: {
    color: colors.muted,
    fontSize: 13,
  },
  help: {
    color: colors.mutedSubtle,
    fontSize: 12,
  },
  fileBox: {
    gap: 8,
  },
  fileLabel: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  flex: {
    flex: 1,
  },
});
