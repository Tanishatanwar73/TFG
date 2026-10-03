import React, { useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { FounderProfile as FounderProfileView } from '../../components/founder/FounderProfile';
import { MemberCredentialPackModal } from '../../components/features/community/MemberCredentialPackModal';
import { Button } from '../../components/common/Button';
import { Award, Globe, ExternalLink, Printer } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { founderService } from '../../services/founderService';

export const MyPortfolio = () => {
  const auth = useAuth();
  const [showCredentialPack, setShowCredentialPack] = useState(false);
  const [saveError, setSaveError] = useState('');
  const user = auth.user;

  const handleSave = async (draft) => {
    setSaveError('');
    const updates = {
      name: draft.name,
      title: draft.title,
      companyName: draft.company,
      location: draft.location,
      avatarUrl: draft.avatarUrl,
      bio: draft.summary,
      caseStudies: draft.caseStudies,
    };

    const result = await founderService.updateProfile(user.id, updates);
    if (!result.success) {
      setSaveError(result.error || 'Could not save portfolio changes.');
      throw new Error(result.error || 'Could not save portfolio changes.');
    }

    auth.updateUser(updates);
  };

  return (
    <DashboardLayout
      title="My Executive Portfolio & Dossier"
      subtitle={`Live at ${user?.subdomain || 'founder'}.thefoundergrid.com`}
      actions={
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            icon={Award}
            onClick={() => setShowCredentialPack(true)}
          >
            Generate Credential Pack
          </Button>
          <a
            href={`/portfolio/${user?.subdomain}`}
            target="_blank" 
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950"
          >
            <Globe className="w-3.5 h-3.5 text-amber-500" />
            <span>Public View</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      }
    >
      <FounderProfileView
        member={user}
        onOpenCredentialPack={() => setShowCredentialPack(true)}
        onSave={handleSave}
        isOwner={true}
      />

      {saveError && (
        <p className="mt-3 text-sm text-red-400" role="alert">{saveError}</p>
      )}

      {showCredentialPack && (
        <MemberCredentialPackModal
          isOpen={showCredentialPack}
          onClose={() => setShowCredentialPack(false)}
          member={user}
        />
      )}
    </DashboardLayout>
  );
};

export default MyPortfolio;
