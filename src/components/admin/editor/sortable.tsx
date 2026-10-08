'use client';

import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type Announcements,
  type DragEndEvent,
} from '@dnd-kit/core';
import { restrictToParentElement, restrictToVerticalAxis } from '@dnd-kit/modifiers';
import {
  arrayMove,
  rectSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import {
  createContext,
  useContext,
  useId,
  type ComponentProps,
  type CSSProperties,
  type ReactNode,
} from 'react';
import { cn } from '@/lib/cn';

type HandleProps = Pick<ComponentProps<'button'>, 'aria-describedby'> & Record<string, unknown>;

const HandleContext = createContext<{ attributes: HandleProps; listeners: HandleProps | undefined } | null>(
  null,
);

type SortableListProps<T> = {
  items: T[];
  getId: (item: T) => string;
  /** Libellé lu par les lecteurs d'écran (« Chef privé »). */
  getLabel: (item: T) => string;
  onReorder: (items: T[]) => void;
  /** `grid` : vignettes (logos des partenaires) ; `list` (défaut) : lignes. */
  layout?: 'list' | 'grid';
  className?: string;
  /** Élément conteneur (`ul` par défaut). */
  as?: 'ul' | 'ol' | 'tbody';
  renderItem: (item: T, index: number) => ReactNode;
};

/**
 * Liste réordonnable au glisser-déposer (services, rubriques, logos, formations, éléments d'un éditeur).
 * Au clavier : `Espace` sur la poignée pour saisir l'élément, flèches pour le déplacer, `Espace` pour le déposer,
 * `Échap` pour annuler ; chaque étape est annoncée en français.
 */
export function SortableList<T>({
  items,
  getId,
  getLabel,
  onReorder,
  layout = 'list',
  className,
  as: Tag = 'ul',
  renderItem,
}: SortableListProps<T>) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  // Identifiant stable : sans lui, dnd-kit numérote ses descriptions différemment côté serveur et navigateur.
  const contextId = useId();
  const ids = items.map(getId);
  const labelOf = (id: string | number) => {
    const item = items.find((candidate) => getId(candidate) === String(id));
    return item ? `« ${getLabel(item)} »` : 'L’élément';
  };
  const positionOf = (id: string | number) => ids.indexOf(String(id)) + 1;
  const announcements: Announcements = {
    onDragStart: ({ active }) =>
      `${labelOf(active.id)} saisi, position ${positionOf(active.id)} sur ${ids.length}. Flèches pour déplacer, Espace pour déposer, Échap pour annuler.`,
    onDragOver: ({ active, over }) =>
      over
        ? `${labelOf(active.id)} déplacé en position ${positionOf(over.id)} sur ${ids.length}.`
        : undefined,
    onDragEnd: ({ active, over }) =>
      over
        ? `${labelOf(active.id)} déposé en position ${positionOf(over.id)} sur ${ids.length}.`
        : `${labelOf(active.id)} déposé.`,
    onDragCancel: ({ active }) => `Déplacement annulé. ${labelOf(active.id)} reste à sa place.`,
  };

  function onDragEnd({ active, over }: DragEndEvent) {
    if (!over || active.id === over.id) return;
    const from = ids.indexOf(String(active.id));
    const to = ids.indexOf(String(over.id));
    if (from < 0 || to < 0) return;
    onReorder(arrayMove(items, from, to));
  }

  return (
    <DndContext
      id={contextId}
      sensors={sensors}
      collisionDetection={closestCenter}
      modifiers={
        layout === 'list' ? [restrictToVerticalAxis, restrictToParentElement] : [restrictToParentElement]
      }
      onDragEnd={onDragEnd}
      accessibility={{
        announcements,
        screenReaderInstructions: {
          draggable:
            'Pour réordonner, appuyez sur Espace, déplacez avec les flèches, puis appuyez de nouveau sur Espace pour déposer, ou sur Échap pour annuler.',
        },
      }}
    >
      <SortableContext
        items={ids}
        strategy={layout === 'grid' ? rectSortingStrategy : verticalListSortingStrategy}
      >
        <Tag className={className}>{items.map((item, index) => renderItem(item, index))}</Tag>
      </SortableContext>
    </DndContext>
  );
}

type SortableItemProps = {
  id: string;
  /** Élément rendu (`li` par défaut, `tr` dans un tableau, `div`). */
  as?: 'li' | 'tr' | 'div';
  className?: string;
  children: ReactNode;
};

/** Élément d'une `SortableList` ; la poignée (`DragHandle`) placée à l'intérieur sert à le déplacer. */
export function SortableItem({ id, as: Tag = 'li', className, children }: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style: CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition,
    position: 'relative',
    zIndex: isDragging ? 10 : undefined,
  };
  return (
    <HandleContext.Provider value={{ attributes: attributes as unknown as HandleProps, listeners }}>
      <Tag
        ref={setNodeRef as never}
        style={style}
        className={cn(className, isDragging && 'opacity-90 shadow-4')}
        data-dragging={isDragging || undefined}
      >
        {children}
      </Tag>
    </HandleContext.Provider>
  );
}

/** Poignée `icon/grip` 18 px : déplace l'élément à la souris, au doigt ou au clavier. */
export function DragHandle({ label, className }: { label: string; className?: string }) {
  const context = useContext(HandleContext);
  return (
    <button
      type="button"
      aria-label={`Déplacer ${label}`}
      className={cn(
        'flex size-8 shrink-0 cursor-grab touch-none items-center justify-center rounded-sm text-icon-default hover:bg-neutral-100 hover:text-text-main active:cursor-grabbing',
        className,
      )}
      {...context?.attributes}
      aria-roledescription="poignée de déplacement"
      {...context?.listeners}
    >
      <GripVertical aria-hidden size={18} />
    </button>
  );
}

/** Déplacement d'un élément sans glisser-déposer (menus « Monter » / « Descendre »). */
export function moveItem<T>(items: T[], index: number, offset: -1 | 1): T[] {
  const target = index + offset;
  if (target < 0 || target >= items.length) return items;
  return arrayMove(items, index, target);
}
