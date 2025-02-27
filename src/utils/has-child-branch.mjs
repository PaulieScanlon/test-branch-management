export const hasChildBranch = (branch_id, branches) => {
  const childBranch = branches.find((branch) => branch.parent_id === branch_id);
  return {
    has_child: !!childBranch,
    child_branch_id: childBranch ? childBranch.id : null,
    child_branch_name: childBranch ? childBranch.name : null,
  };
};
