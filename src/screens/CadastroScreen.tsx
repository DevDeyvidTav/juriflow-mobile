import { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { deleteCadastroFiles, keepFile } from '../data/files';
import { pickDocument, pickFromCamera, pickFromLibrary, type PickedFile } from '../data/pick-file';
import { attachmentSlots, canAddFile, fileProblem, folderLimit, isHealthBenefit } from '../lib/benefits';
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
import { FileFolders } from '../ui/FileFolders';
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
  const [files, setFiles] = useState<Record<string, DraftFile[]>>({});
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const [askComment, setAskComment] = useState(false);
  const [comment, setComment] = useState('');

  const kanban = queue.catalog.kanbans.find((item) => item.id === kanbanId);
  const required = kanban?.requiredFields;
  const benefit = queue.catalog.benefits.find((item) => item.id === benefitId) ?? null;
  const fileSlots = queue.catalogLoading ? [] : attachmentSlots(queue.catalog.benefits, benefit);
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

  async function attach(label: string, maxFiles: number | null, pick: () => Promise<PickedFile | null>) {
    setMessage('');
    const currentCount = files[label]?.length ?? 0;
    if (!canAddFile(currentCount, maxFiles)) {
      setMessage(`A pasta "${label}" aceita no máximo ${maxFiles} arquivo(s).`);
      return;
    }
    try {
      const file = await pick();
      if (!file) return;
      const problem = fileProblem(file.mime, file.size);
      if (problem) {
        setMessage(problem);
        return;
      }
      setFiles((current) => ({ ...current, [label]: [...(current[label] ?? []), { ...file, label }] }));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Não foi possível anexar o arquivo.');
    }
  }

  function clearForm() {
    setForm(emptyForm());
    setFiles({});
    setBenefitId('');
    setMessage('');
    setComment('');
    setAskComment(false);
  }

  function submit() {
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
    setAskComment(true);
  }

  async function confirmComment() {
    const text = comment.trim();
    if (!text) {
      setMessage('O comentário é obrigatório.');
      return;
    }
    setAskComment(false);
    setSaving(true);
    const id = createId();
    try {
      const stored: LocalFile[] = [];
      for (const group of Object.values(files)) {
        for (const file of group) {
          const fileId = createId();
          stored.push({
            id: fileId,
            label: file.label,
            name: file.name,
            mime: file.mime,
            uri: await keepFile(id, fileId, file.uri, file.name),
          });
        }
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
        comment: text,
        commentSent: false,
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
        {queue.catalogLoading ? (
          <Text style={styles.help}>Carregando opções...</Text>
        ) : queue.catalog.benefits.length > 0 ? (
          <SelectField
            label="Tipo de benefício"
            required={req('targetBenefit')}
            value={benefitId}
            placeholder="Selecione o tipo de benefício"
            searchable
            options={queue.catalog.benefits.map((item) => ({ value: item.id, label: item.name }))}
            onChange={chooseBenefit}
          />
        ) : (
          <TextField
            label="Tipo de benefício"
            required={req('targetBenefit')}
            value={form.targetBenefit}
            placeholder="Ex: Aposentadoria por invalidez, auxílio doença..."
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
        <FileFolders
          folders={fileSlots}
          files={files}
          onAdd={(folder, source) => {
            const pick = source === 'camera' ? pickFromCamera : source === 'library' ? pickFromLibrary : pickDocument;
            void attach(folder.label, folderLimit(folder), pick);
          }}
          onRemove={(label, index) => {
            setFiles((current) => ({
              ...current,
              [label]: (current[label] ?? []).filter((_, itemIndex) => itemIndex !== index),
            }));
          }}
        />
      ) : null}

      <Button label={saving ? 'Guardando...' : 'Guardar cadastro'} onPress={submit} disabled={saving || !queue.ready} />
      <Button label="Limpar formulário" tone="ghost" onPress={clearForm} />

      <Modal visible={askComment} transparent animationType="fade" onRequestClose={() => setAskComment(false)}>
        <Pressable style={styles.backdrop} onPress={() => setAskComment(false)}>
          <Pressable style={styles.sheet} onPress={() => undefined}>
            <Text style={styles.sheetTitle}>Você precisa anexar um comentário</Text>
            <Text style={styles.subtitle}>
              O comentário é obrigatório. Ao confirmar, o cadastro entra na fila e o texto sobe com o cliente.
            </Text>
            <TextInput
              autoFocus
              multiline
              value={comment}
              onChangeText={setComment}
              placeholder="Ex.: cliente pediu retorno na sexta, documentos incompletos..."
              placeholderTextColor={colors.mutedSubtle}
              style={styles.comment}
            />
            <View style={styles.actions}>
              <Button label="Cadastrar cliente" onPress={() => void confirmComment()} disabled={!comment.trim() || saving} />
              <Button label="Voltar" tone="ghost" onPress={() => setAskComment(false)} />
            </View>
          </Pressable>
        </Pressable>
      </Modal>
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
  backdrop: {
    flex: 1,
    backgroundColor: '#000000a6',
    justifyContent: 'center',
    padding: 16,
  },
  sheet: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    gap: 12,
  },
  sheetTitle: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  comment: {
    minHeight: 110,
    textAlignVertical: 'top',
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    color: colors.text,
    fontSize: 14,
  },
  actions: {
    gap: 8,
  },
});
