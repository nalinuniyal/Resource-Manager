import { useEffect, useState } from "react";
import { toast } from "sonner";
import { createEntity, deleteEntity, updateEntity } from "@/lib/api";
import { getErrorMessage } from "@/lib/utils";

export function useEntityManager({ entityName, table, fetcher, enabled = true }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(Boolean(enabled));
  const [saving, setSaving] = useState(false);

  const loadItems = async () => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data, error } = await fetcher();

    if (error) {
      toast.error(getErrorMessage(error, `Unable to load ${entityName}.`));
      setItems([]);
    } else {
      setItems(data ?? []);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadItems();
  }, [enabled]);

  const saveItem = async (payload, currentItem) => {
    setSaving(true);
    const action = currentItem?.id
      ? updateEntity(table, currentItem.id, payload)
      : createEntity(table, payload);

    const { error } = await action;

    if (error) {
      toast.error(getErrorMessage(error, `Unable to save ${entityName}.`));
      setSaving(false);
      return false;
    }

    toast.success(currentItem?.id ? `${entityName} updated.` : `${entityName} created.`);
    await loadItems();
    setSaving(false);
    return true;
  };

  const removeItem = async (id) => {
    setSaving(true);
    const { error } = await deleteEntity(table, id);

    if (error) {
      toast.error(getErrorMessage(error, `Unable to delete ${entityName}.`));
      setSaving(false);
      return false;
    }

    toast.success(`${entityName} deleted.`);
    await loadItems();
    setSaving(false);
    return true;
  };

  return {
    items,
    loading,
    saving,
    refresh: loadItems,
    saveItem,
    removeItem
  };
}
