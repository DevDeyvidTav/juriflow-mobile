import { useEffect, useState } from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import Constants from 'expo-constants';
import { fetchUpdate } from '../data/api';
import type { AppUpdate } from '../lib/version';
import { useQueue } from '../state/queue';
import { useSession } from '../state/session';
import { colors } from '../theme/colors';
import { Header } from '../ui/Header';
import { Notice } from '../ui/Notice';
import { Screen } from '../ui/Screen';
import type { HistoryRow } from '../lib/history';
import { CadastroScreen } from './CadastroScreen';
import { DetalheScreen } from './DetalheScreen';
import { CloudDetail, FilaScreen } from './FilaScreen';

type Tab = 'cadastro' | 'fila';

export function MainScreen() {
  const { session, signOut } = useSession();
  const queue = useQueue();
  const [tab, setTab] = useState<Tab>('cadastro');
  const [openRow, setOpenRow] = useState<HistoryRow | null>(null);
  const [update, setUpdate] = useState<AppUpdate | null>(null);

  useEffect(() => {
    const version = Constants.expoConfig?.version ?? '1.0.0';
    fetchUpdate(version).then(setUpdate);
  }, []);

  return (
    <Screen>
      <Header
        name={session?.user.name ?? ''}
        online={queue.online}
        syncing={queue.syncing}
        onSync={() => void queue.syncNow()}
        onLogout={() => void signOut()}
      />
      {update ? (
        <View style={styles.update}>
          <Notice text={`Nova versão ${update.version} disponível.${update.notes ? ` ${update.notes}` : ''}`} />
          <Pressable onPress={() => Linking.openURL(update.apkUrl)}>
            <Text style={styles.updateLink}>Baixar atualização</Text>
          </Pressable>
        </View>
      ) : null}
      {openRow ? (
        openRow.localId ? (
          <DetalheScreen id={openRow.localId} onBack={() => setOpenRow(null)} />
        ) : (
          <CloudDetail row={openRow} onBack={() => setOpenRow(null)} />
        )
      ) : (
        <>
          <View style={styles.tabs}>
            <TabButton label="Novo cadastro" active={tab === 'cadastro'} onPress={() => setTab('cadastro')} />
            <TabButton label="Histórico" active={tab === 'fila'} onPress={() => setTab('fila')} />
          </View>
          {tab === 'cadastro' ? (
            <CadastroScreen onSaved={() => setTab('fila')} />
          ) : (
            <FilaScreen onOpen={setOpenRow} />
          )}
        </>
      )}
    </Screen>
  );
}

function TabButton({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.tab, active ? styles.tabOn : null]}>
      <Text style={[styles.tabText, active ? styles.tabTextOn : null]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tabs: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  tab: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tabOn: {
    backgroundColor: colors.secondary,
    borderColor: colors.secondary,
  },
  tabText: {
    color: colors.muted,
    fontWeight: '600',
  },
  tabTextOn: {
    color: colors.white,
  },
  update: {
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 6,
  },
  updateLink: {
    color: colors.accent,
    fontWeight: '700',
  },
});
