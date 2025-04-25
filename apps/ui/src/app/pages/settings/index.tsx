import React from 'react';
import {
  AppSettings,
  useListSettingsQuery,
  useUpdateSettingsMutation,
} from '../../redux/apis/del.api';
import { TabView, TabPanel } from 'primereact/tabview';
import TextInput from '../../components/form/text-input';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import Button from '../../components/form/button';
import { isValidCron } from 'cron-validator';
import cronstrue from 'cronstrue';
import ErrorMessage from '../../components/error-message';
import { Helmet } from 'react-helmet-async';

const SettingsPage = () => {
  const { data: settings, ...rest } = useListSettingsQuery(undefined);
  const [updateSettings, { error }] = useUpdateSettingsMutation();

  const {
    control,
    formState: { errors, isSubmitting, isDirty },
    handleSubmit,
    reset,
  } = useForm<AppSettings>({
    mode: 'onChange',
    defaultValues: {
      SETTING_LOG_RETENTION_PERIOD_DAYS: 30,
      SETTING_LOG_PRUNING_CRON: '',
      SETTING_LOG_INTEGRITY_CRON: '',
    },
  });

  const resetForm = React.useCallback(() => {
    if (settings) {
      reset({
        ...settings,
        SETTING_LOG_RETENTION_PERIOD_DAYS: Number(
          settings?.SETTING_LOG_RETENTION_PERIOD_DAYS
        ),
      });
    }
  }, [reset, settings]);

  React.useEffect(() => {
    resetForm();
  }, [resetForm]);

  const onDiscard = () => {
    resetForm();
  };

  const onSubmit: SubmitHandler<AppSettings> = async (data) => {
    return updateSettings(data);
  };

  return (
    <>
      <Helmet>
        <title>Dels Application Settings</title>
      </Helmet>
      <div className="card">
        <form onSubmit={handleSubmit(onSubmit)} className="p-fluid">
          <div className="col-12 ">
            <ErrorMessage error={error} />
          </div>
          <TabView>
            <TabPanel header="Log Retention">
              <div className="grid formgrid">
                <div className="col-12 mb-2 lg:col-6 lg:mb-0">
                  <Controller
                    name="SETTING_LOG_RETENTION_PERIOD_DAYS"
                    control={control}
                    rules={{
                      required: 'Log Retention Period is required.',
                      min: {
                        value: 1,
                        message: 'Log Retention Period must be greater than 0.',
                      },
                      pattern: {
                        value: /^[0-9]+$/,
                        message: 'Log Retention Period must be a number.',
                      },
                    }}
                    render={({ field }) => (
                      <TextInput
                        {...field}
                        onChange={(event) =>
                          field.onChange(Number(event.target.value))
                        }
                        label="Log Retention"
                        placeholder="Log Retention (days)"
                        className="w-full"
                        type="number"
                        error={
                          errors.SETTING_LOG_RETENTION_PERIOD_DAYS?.message
                        }
                        labelClassname="block text-900 font-medium text-xl mb-2"
                      />
                    )}
                  />
                </div>
                <div className="col-12 mb-2 lg:col-6 lg:mb-0">
                  <Controller
                    name="SETTING_LOG_PRUNING_CRON"
                    control={control}
                    rules={{
                      required: 'Log Pruning Cron is required.',
                      validate: (value: string) => {
                        return (
                          isValidCron(value) || 'Log Pruning Cron is invalid.'
                        );
                      },
                    }}
                    render={({ field }) => (
                      <TextInput
                        {...field}
                        label="Log Pruning Job (CRON expression)"
                        placeholder="Log Pruning Job (CRON expression)"
                        className="w-full"
                        error={errors.SETTING_LOG_PRUNING_CRON?.message}
                        labelClassname="block text-900 font-medium text-xl mb-2"
                        tooltip={
                          isValidCron(field.value)
                            ? cronstrue.toString(field.value, { verbose: true })
                            : ''
                        }
                        tooltipOptions={{
                          position: 'top',
                          event: 'focus',
                        }}
                      />
                    )}
                  />
                </div>
              </div>
            </TabPanel>
            <TabPanel header="Integrity Check Process">
              <div className="grid formgrid">
                <div className="col-12 mb-2 lg:col-6 lg:mb-0">
                  <Controller
                    name="SETTING_LOG_INTEGRITY_CRON"
                    control={control}
                    rules={{
                      required: 'Integrity Check CRON is required.',
                      validate: (value: string) => {
                        return (
                          isValidCron(value) ||
                          'Integrity Check CRON is invalid.'
                        );
                      },
                    }}
                    render={({ field }) => (
                      <TextInput
                        {...field}
                        label="Integrity Check Job (CRON expression)"
                        placeholder="Integrity Check (CRON expression)"
                        className="w-full"
                        error={errors.SETTING_LOG_INTEGRITY_CRON?.message}
                        labelClassname="block text-900 font-medium text-xl mb-2"
                        tooltip={
                          isValidCron(field.value)
                            ? cronstrue.toString(field.value, { verbose: true })
                            : ''
                        }
                        tooltipOptions={{
                          position: 'top',
                          event: 'focus',
                        }}
                      />
                    )}
                  />
                </div>
              </div>
            </TabPanel>
          </TabView>
          <div className="flex justify-end">
            <Button
              label="Submit"
              type="submit"
              loading={isSubmitting}
              className="p-3 text-xl"
              disabled={!isDirty}
            />
            <Button
              label="Discard"
              loading={isSubmitting}
              className="p-3 text-xl p-button-danger ml-5"
              disabled={!isDirty}
              onClick={onDiscard}
            />
          </div>
        </form>
      </div>
    </>
  );
};

export default SettingsPage;
