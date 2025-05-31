import { useAdminSkills } from '@/application/admin/skills/useSkills';
import { SkillForm } from '@/presentation/admin/components/features/skills/SkillForm';
import { useEffect, useState } from 'react';
import { Skill } from '@/domain/entities/Skill';
import { Button } from '@/presentation/shared/ui/button';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/presentation/shared/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/presentation/shared/ui/alert-dialog';

export const AdminSkillsView = () => {
  const { getAllSkills, createSkill, updateSkill, deleteSkill } = useAdminSkills();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);

  const fetchSkills = async () => {
    try {
      const data = await getAllSkills();
      setSkills(data);
    } catch (err) {
      setError('Failed to load skills');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSkills();
  }, [getAllSkills]);

  const handleCreate = async (skill: Omit<Skill, 'id'>) => {
    try {
      await createSkill(skill);
      setIsFormOpen(false);
      fetchSkills();
    } catch (err) {
      setError('Failed to create skill');
      console.error(err);
    }
  };

  const handleUpdate = async (skill: Omit<Skill, 'id'>) => {
    if (!selectedSkill) return;
    try {
      await updateSkill(selectedSkill.id, skill);
      setIsFormOpen(false);
      setSelectedSkill(null);
      fetchSkills();
    } catch (err) {
      setError('Failed to update skill');
      console.error(err);
    }
  };

  const handleDelete = async () => {
    if (!selectedSkill) return;
    try {
      await deleteSkill(selectedSkill.id);
      setIsDeleteDialogOpen(false);
      setSelectedSkill(null);
      fetchSkills();
    } catch (err) {
      setError('Failed to delete skill');
      console.error(err);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  // Group skills by category
  const skillsByCategory = skills.reduce((acc, skill) => {
    if (!acc[skill.category]) {
      acc[skill.category] = [];
    }
    acc[skill.category].push(skill);
    return acc;
  }, {} as Record<string, Skill[]>);

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Manage Skills</h1>
        <Button onClick={() => {
          setSelectedSkill(null);
          setIsFormOpen(true);
        }}>
          <Plus className="w-4 h-4 mr-2" />
          Add Skill
        </Button>
      </div>

      {Object.entries(skillsByCategory).map(([category, categorySkills]) => (
        <div key={category} className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">{category}</h2>
          <div className="grid gap-4">
            {categorySkills.map((skill) => (
              <div
                key={skill.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div>
                  <h3 className="text-lg font-semibold">{skill.name}</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {skill.description}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedSkill(skill);
                      setIsFormOpen(true);
                    }}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedSkill(skill);
                      setIsDeleteDialogOpen(true);
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedSkill ? 'Edit Skill' : 'Create Skill'}
            </DialogTitle>
          </DialogHeader>
          <SkillForm
            skill={selectedSkill ?? undefined}
            onSubmit={selectedSkill ? handleUpdate : handleCreate}
            onCancel={() => {
              setIsFormOpen(false);
              setSelectedSkill(null);
            }}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              skill.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
