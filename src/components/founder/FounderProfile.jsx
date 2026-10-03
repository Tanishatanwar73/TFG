import React, { useState } from 'react';
import { FounderHeader } from './FounderHeader';
import { FounderStory } from './FounderStory';
import { CaseStudies, MyPortfolio } from './CaseStudies';
import { FounderArticles } from './FounderArticles';

export const FounderProfile = ({
  member,
  onOpenCredentialPack,
  onOpenInquiry,
  onSelectArticle,
  onSave,
  isOwner = false,
}) => {
  const [isEditing, setIsEditing] = useState(false);

  if (!member) return null;

  if (isEditing) {
    return (
      <MyPortfolio
        member={member}
        onSave={async (draft) => {
          await onSave?.(draft);
          setIsEditing(false);
        }}
      />
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto py-6">
      <FounderHeader
        member={member}
        onOpenCredentialPack={onOpenCredentialPack}
        onOpenInquiry={onOpenInquiry}
        isOwner={isOwner}
        onEditDossier={() => setIsEditing(true)}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <FounderStory member={member} />
        </div>

        <div className="lg:col-span-2 space-y-8">
          <CaseStudies caseStudies={member.caseStudies} />
          <FounderArticles
            articles={member.articles || []}
            onSelectArticle={onSelectArticle}
          />
        </div>
      </div>
    </div>
  );
};

export default FounderProfile;
