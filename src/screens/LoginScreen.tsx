import { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';
import { Button } from '../ui/Button';
import { Notice } from '../ui/Notice';
import { Screen } from '../ui/Screen';
import { TextField } from '../ui/TextField';
import { colors } from '../theme/colors';
import { useSession } from '../state/session';

export function LoginScreen() {
  const { signIn } = useSession();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit() {
    setError('');
    setLoading(true);
    try {
      await signIn(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao fazer login.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen>
      <KeyboardAvoidingView
        style={styles.wrap}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Text style={styles.brand}>JuriFlow</Text>
        <Text style={styles.subtitle}>Cadastro de clientes em campo</Text>
        <View style={styles.card}>
          <Text style={styles.title}>Bem-vindo de volta</Text>
          <Text style={styles.hint}>Entre com o mesmo usuário do sistema</Text>
          {error ? <Notice text={error} tone="error" /> : null}
          <TextField label="E-mail" value={email} onChangeText={setEmail} placeholder="seu@email.com" keyboard="email-address" />
          <TextField label="Senha" value={password} onChangeText={setPassword} placeholder="Sua senha" secure />
          <Button label={loading ? 'Entrando...' : 'Entrar'} onPress={submit} disabled={loading || !email.trim() || !password} />
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    gap: 8,
  },
  brand: {
    color: colors.white,
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
  },
  subtitle: {
    color: colors.accent,
    textAlign: 'center',
    marginBottom: 16,
  },
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 16,
    padding: 20,
    gap: 12,
  },
  title: {
    color: colors.white,
    fontSize: 20,
    fontWeight: '600',
  },
  hint: {
    color: colors.muted,
    fontSize: 13,
    marginBottom: 4,
  },
});
