import type { AppNotification, Task, User } from '@/types'
import { generateId } from '@/utils/id'
import { addDays } from '@/utils/date'

// ============================================================================
// Comptes de démonstration
// ============================================================================
// ADMIN : admin@guinetache.com / Admin123!
// USER  : user@guinetache.com  / User123!
// ============================================================================

const now = new Date()
const iso = (d: Date) => d.toISOString()

export const SEED_USERS: User[] = [
  {
    id: 'user_admin',
    fullName: 'Aïssatou Diallo',
    email: 'admin@guinetache.com',
    password: 'Admin123!',
    role: 'ADMIN',
    isActive: true,
    createdAt: iso(addDays(now, -60)),
    updatedAt: iso(addDays(now, -60)),
  },
  {
    id: 'user_demo',
    fullName: 'Mamadou Bah',
    email: 'user@guinetache.com',
    password: 'User123!',
    role: 'USER',
    isActive: true,
    createdAt: iso(addDays(now, -45)),
    updatedAt: iso(addDays(now, -45)),
  },
  {
    id: 'user_002',
    fullName: 'Fatoumata Camara',
    email: 'fatoumata.camara@guinetache.com',
    password: 'User123!',
    role: 'USER',
    isActive: true,
    createdAt: iso(addDays(now, -40)),
    updatedAt: iso(addDays(now, -40)),
  },
  {
    id: 'user_003',
    fullName: 'Ibrahima Sow',
    email: 'ibrahima.sow@guinetache.com',
    password: 'User123!',
    role: 'USER',
    isActive: true,
    createdAt: iso(addDays(now, -30)),
    updatedAt: iso(addDays(now, -30)),
  },
  {
    id: 'user_004',
    fullName: 'Mariama Barry',
    email: 'mariama.barry@guinetache.com',
    password: 'User123!',
    role: 'USER',
    isActive: false,
    createdAt: iso(addDays(now, -20)),
    updatedAt: iso(addDays(now, -5)),
  },
]

function task(partial: Partial<Task> & Pick<Task, 'title' | 'description' | 'assignedToId'>): Task {
  return {
    id: generateId('task'),
    status: 'TODO',
    priority: 'MEDIUM',
    createdAt: iso(addDays(now, -Math.floor(Math.random() * 20))),
    updatedAt: iso(now),
    dueDate: iso(addDays(now, 5)),
    createdById: 'user_admin',
    ...partial,
  }
}

export const SEED_TASKS: Task[] = [
  task({
    title: 'Créer le rapport mensuel',
    description: 'Compiler les statistiques de vente du mois et préparer une synthèse pour la direction.',
    assignedToId: 'user_demo',
    status: 'IN_PROGRESS',
    priority: 'HIGH',
    dueDate: iso(addDays(now, 3)),
  }),
  task({
    title: 'Mettre à jour la documentation API',
    description: "Ajouter les nouveaux endpoints et corriger les exemples obsolètes.",
    assignedToId: 'user_demo',
    status: 'TODO',
    priority: 'MEDIUM',
    dueDate: iso(addDays(now, 10)),
  }),
  task({
    title: 'Corriger le bug de connexion',
    description: 'Certains utilisateurs signalent une déconnexion intempestive après 5 minutes.',
    assignedToId: 'user_demo',
    status: 'DONE',
    priority: 'URGENT',
    dueDate: iso(addDays(now, -2)),
    updatedAt: iso(addDays(now, -1)),
  }),
  task({
    title: 'Préparer la présentation client',
    description: 'Slides de présentation pour la réunion de suivi trimestrielle.',
    assignedToId: 'user_demo',
    status: 'TODO',
    priority: 'LOW',
    dueDate: iso(addDays(now, -1)),
  }),
  task({
    title: 'Réviser le design du dashboard',
    description: 'Harmoniser les couleurs et les espacements selon la nouvelle charte graphique.',
    assignedToId: 'user_002',
    status: 'IN_PROGRESS',
    priority: 'MEDIUM',
    dueDate: iso(addDays(now, 7)),
  }),
  task({
    title: 'Audit de sécurité',
    description: "Vérifier les dépendances et les permissions d'accès aux données sensibles.",
    assignedToId: 'user_003',
    status: 'TODO',
    priority: 'URGENT',
    dueDate: iso(addDays(now, 2)),
  }),
  task({
    title: 'Former les nouveaux employés',
    description: "Organiser une session d'intégration sur l'outil de gestion des tâches.",
    assignedToId: 'user_002',
    status: 'DONE',
    priority: 'LOW',
    dueDate: iso(addDays(now, -5)),
  }),
  task({
    title: 'Optimiser les performances de la page tâches',
    description: 'Réduire le temps de chargement du tableau de tâches sur mobile.',
    assignedToId: 'user_003',
    status: 'TODO',
    priority: 'HIGH',
    dueDate: iso(addDays(now, 14)),
  }),
]

export const SEED_NOTIFICATIONS: AppNotification[] = [
  {
    id: generateId('notif'),
    userId: 'user_demo',
    type: 'TASK_ASSIGNED',
    title: 'Nouvelle tâche assignée',
    message: 'Une nouvelle tâche vous a été assignée : Créer le rapport mensuel.',
    read: false,
    createdAt: iso(addDays(now, -3)),
  },
  {
    id: generateId('notif'),
    userId: 'user_demo',
    type: 'TASK_OVERDUE',
    title: 'Tâche en retard',
    message: 'La tâche "Préparer la présentation client" a dépassé sa date limite.',
    read: false,
    createdAt: iso(addDays(now, -1)),
  },
  {
    id: generateId('notif'),
    userId: 'user_demo',
    type: 'SYSTEM',
    title: 'Bienvenue sur GuineeTache',
    message: 'Votre compte a été créé avec succès. Bonne organisation !',
    read: true,
    createdAt: iso(addDays(now, -45)),
  },
]
