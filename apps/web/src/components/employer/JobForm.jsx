/**
 * Green Matchers - Employer Job Form Component
 * Form for creating and editing job postings
 */
import React, { useState } from 'react';
import { useForm } from '@/hooks';
import Input from '../common/Input';
import Button from '../common/Button';
import SDGTag from '../common/SDGTag';
import { jobsService } from '@/services';
import { SDG_GOALS } from '@/config/constants';

const initialValues = {
  title: '',
  description: '',
  requirements: '',
  salary_min: '',
  salary_max: '',
  location: '',
  career_id: '',
  sdg_tags: [],
};

const validate = (values) => {
  const errors = {};
  if (!values.title) errors.title = 'Job title is required';
  if (!values.description) errors.description = 'Job description is required';
  if (!values.location) errors.location = 'Location is required';
  return errors;
};

/**
 * JobForm component
 * @param {Object} props - Component props
 * @returns {JSX.Element}
 */
const JobForm = ({ job, onSuccess, onCancel }) => {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const {
    values,
    errors,
    handleChange,
    handleSubmit,
    setFieldValue,
  } = useForm(job ? { ...initialValues, ...job } : initialValues, validate);

  const handleFormSubmit = async (formValues) => {
    setSubmitting(true);
    setError(null);
    try {
      const data = {
        ...formValues,
        salary_min: formValues.salary_min ? parseInt(formValues.salary_min) : null,
        salary_max: formValues.salary_max ? parseInt(formValues.salary_max) : null,
        career_id: formValues.career_id ? parseInt(formValues.career_id) : null,
      };

      if (job) {
        await jobsService.updateJob(job.id, data);
      } else {
        await jobsService.createJob(data);
      }
      
      onSuccess?.();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save job');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleSDGTag = (tagId) => {
    const currentTags = values.sdg_tags || [];
    if (currentTags.includes(tagId)) {
      setFieldValue('sdg_tags', currentTags.filter((t) => t !== tagId));
    } else {
      setFieldValue('sdg_tags', [...currentTags, tagId]);
    }
  };

  return (
    <form onSubmit={(e) => handleSubmit(e, handleFormSubmit)} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      <Input
        label="Job Title"
        name="title"
        value={values.title}
        onChange={handleChange}
        error={errors.title}
        required
        placeholder="e.g., Sustainability Engineer"
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          name="description"
          value={values.description}
          onChange={handleChange}
          rows={4}
          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
            errors.description ? 'border-red-500 bg-red-50' : 'border-gray-300'
          }`}
          placeholder="Describe the job role and responsibilities..."
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-500">{errors.description}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Minimum Salary ($)"
          name="salary_min"
          type="number"
          value={values.salary_min}
          onChange={handleChange}
          placeholder="e.g., 50000"
        />

        <Input
          label="Maximum Salary ($)"
          name="salary_max"
          type="number"
          value={values.salary_max}
          onChange={handleChange}
          placeholder="e.g., 80000"
        />
      </div>

      <Input
        label="Location"
        name="location"
        value={values.location}
        onChange={handleChange}
        error={errors.location}
        required
        placeholder="e.g., Remote, New York, NY"
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          SDG Goals
        </label>
        <div className="flex flex-wrap gap-2">
          {SDG_GOALS.map((sdg) => (
            <button
              key={sdg.id}
              type="button"
              onClick={() => toggleSDGTag(sdg.id)}
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border transition-all ${
                values.sdg_tags?.includes(sdg.id) ? 'ring-2 ring-offset-1' : 'opacity-60'
              }`}
              style={{
                backgroundColor: values.sdg_tags?.includes(sdg.id) ? sdg.color : `${sdg.color}20`,
                color: values.sdg_tags?.includes(sdg.id) ? 'white' : sdg.color,
                borderColor: sdg.color,
              }}
            >
              SDG {sdg.id}
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-end space-x-4 pt-4 border-t">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" loading={submitting}>
          {job ? 'Update Job' : 'Create Job'}
        </Button>
      </div>
    </form>
  );
};

export default JobForm;
